// app/api/parse-license/route.ts
import { NextRequest, NextResponse } from "next/server";
import { decodePdf417, parseAAMVA } from "@/lib/pdf417";
import { mapAAMVAtoDL } from "@/lib/schemas";
import { sql } from "@vercel/postgres";

export const runtime = "nodejs"; // WASM decoding prefers Node runtime

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Handle client-side barcode detection (new approach)
      const body = await req.json();
      const { barcodeData, fileName, fileType, fileSize } = body;
      
      if (!barcodeData) {
        return NextResponse.json({ error: "barcode data is required" }, { status: 400 });
      }

      // 1) Parse AAMVA from client-detected barcode data
      const aamva = parseAAMVA(barcodeData);

      // 2) Map to normalized DL schema
      const record = mapAAMVAtoDL(aamva);

      // 3) Persist to Postgres
      const inserted = await sql<{
        id: number;
      }>`
        INSERT INTO licenses (file_key, mime_type, source, payload_raw, parsed_json, confidence)
        VALUES (${fileName || null}, ${fileType || 'unknown'}, 'client-pdf417', ${barcodeData}, ${JSON.stringify(record)}::jsonb, ${record.confidence})
        RETURNING id;
      `;

      return NextResponse.json(
        { id: inserted.rows[0].id, data: record },
        { status: 200 }
      );
    } else {
      // Handle server-side barcode detection (fallback approach)
      const form = await req.formData();
      const file = form.get("file") as File | null;
      if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

      if (!/^image\//.test(file.type)) {
        return NextResponse.json({ error: "upload an image (JPEG/PNG) of the license back" }, { status: 415 });
      }

      const bytes = Buffer.from(await file.arrayBuffer());

      // 1) Decode PDF417(s) - server-side fallback
      const payloads = await decodePdf417(bytes);
      if (payloads.length === 0) {
        return NextResponse.json({ error: "No PDF417 barcode found" }, { status: 422 });
      }

      // 2) Parse AAMVA (use first payload for MVP)
      const aamva = parseAAMVA(payloads[0]);

      // 3) Map to normalized DL schema
      const record = mapAAMVAtoDL(aamva);

      // 4) Persist to Postgres
      const inserted = await sql<{
        id: number;
      }>`
        INSERT INTO licenses (file_key, mime_type, source, payload_raw, parsed_json, confidence)
        VALUES (${null}, ${file.type}, ${record.rawSource}, ${record.rawText ?? ""}, ${JSON.stringify(record)}::jsonb, ${record.confidence})
        RETURNING id;
      `;

      return NextResponse.json(
        { id: inserted.rows[0].id, data: record },
        { status: 200 }
      );
    }
  } catch (err: any) {
    // Avoid leaking PII; return generic error
    return NextResponse.json({ error: err?.message || "internal error" }, { status: 500 });
  }
}
