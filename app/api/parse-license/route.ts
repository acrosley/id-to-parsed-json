// app/api/parse-license/route.ts
import { NextRequest, NextResponse } from "next/server";
import { decodePdf417, parseAAMVA } from "@/lib/pdf417";
import { mapAAMVAtoDL } from "@/lib/schemas";
import { sql } from "@vercel/postgres";

export const runtime = "nodejs"; // WASM decoding prefers Node runtime

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

    if (!/^image\//.test(file.type)) {
      return NextResponse.json({ error: "upload an image (JPEG/PNG) of the license back" }, { status: 415 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // 1) Decode PDF417(s)
    const payloads = await decodePdf417(bytes);
    if (payloads.length === 0) {
      return NextResponse.json({ error: "No PDF417 barcode found" }, { status: 422 });
    }

    // 2) Parse AAMVA (use first payload for MVP)
    const aamva = parseAAMVA(payloads[0]);

    // 3) Map to normalized DL schema
    const record = mapAAMVAtoDL(aamva);

    // 4) Persist to Postgres
    // Table: licenses(id BIGSERIAL PK, file_key TEXT, mime_type TEXT, source TEXT, payload_raw TEXT, parsed_json JSONB, confidence NUMERIC, created_at TIMESTAMPTZ)
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
  } catch (err: any) {
    // Avoid leaking PII; return generic error
    return NextResponse.json({ error: err?.message || "internal error" }, { status: 500 });
  }
}
