/* lib/pdf417.ts
   - decodePdf417: image bytes -> decoded strings[]
   - parseAAMVA:   AAMVA DL/ID payload -> structured fields
*/

export type AAMVAFields = {
    raw: string;
    version?: string;
    issuerIdentificationNumber?: string;
    fileType?: string;            // "DL" or "ID"
    aamva?: boolean;
  
    CustomerIdNumber?: string;    // DAQ
    LastName?: string;            // DCS
    FirstName?: string;           // DAC
    MiddleName?: string;          // DAD
    Suffix?: string;              // DAF or DCU
    Street1?: string;             // DAG
    Street2?: string;             // DAH
    City?: string;                // DAI
    State?: string;               // DAJ
    PostalCode?: string;          // DAK
    DateOfBirth?: string;         // DBB -> YYYY-MM-DD
    IssueDate?: string;           // DBD -> YYYY-MM-DD
    ExpirationDate?: string;      // DBA -> YYYY-MM-DD
    Sex?: string;                 // DBC
    EyeColor?: string;            // DAY
    Height?: string;              // DAU
    LicenseClass?: string;        // DCA or DAR
    Restrictions?: string;        // DCB or DAS
    Endorsements?: string;        // DCD or DAT
  
    elements: Record<string, string>;
  };
  
  const DATE_RE_YYYYMMDD = /^(\d{4})(\d{2})(\d{2})$/;
  const DATE_RE_MMDDYYYY = /^(\d{2})(\d{2})(\d{4})$/;
  
  function normalizeDate(input?: string): string | undefined {
    if (!input) return undefined;
    const s = input.replace(/[^\d]/g, "");
    let m = s.match(DATE_RE_YYYYMMDD);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = s.match(DATE_RE_MMDDYYYY);
    if (m) return `${m[3]}-${m[1]}-${m[2]}`;
    return undefined;
  }
  
  function splitLines(payload: string): string[] {
    return payload
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }
  
  function normalizeZip(input?: string): string | undefined {
    if (!input) return undefined;
    const digits = input.replace(/[^\d]/g, "");
    if (digits.length >= 9) return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
    if (digits.length >= 5) return digits.slice(0, 5);
    return undefined;
  }
  
  function normalizeSex(input?: string): string | undefined {
    if (!input) return undefined;
    const v = input.trim();
    if (v === "1") return "M";
    if (v === "2") return "F";
    if (v === "9") return "X";
    if (/^m(ale)?$/i.test(v)) return "M";
    if (/^f(emale)?$/i.test(v)) return "F";
    if (/^[xnu]$/i.test(v)) return "X";
    return v;
  }
  
  export function parseAAMVA(payload: string): AAMVAFields {
    const raw = payload;
    const lines = splitLines(payload);
  
    const elements: Record<string, string> = {};
  
    const headerLine = lines.find((l) => /^(?:@|ANSI |AAMVA)/i.test(l)) || payload.slice(0, 64);
    const aamvaHeader = /AAMVA|ANSI/i.test(headerLine);
    const versionMatch =
      headerLine.match(/(?:AAMVA|ANSI)[^\d]*(\d{2})/) ||
      payload.match(/(?:AAMVA|ANSI)[^\d]*(\d{2})/);
    const version = versionMatch ? versionMatch[1] : undefined;
  
    const iinMatch =
      headerLine.match(/(\d{4,6})\s*(?:DL|ID)/i) ||
      payload.match(/(?<=\s|^)(\d{4,6})(?=\s*(?:DL|ID))/i);
  
    const fileTypeMatch = headerLine.match(/\b(DL|ID)\b/);
  
    const TAG = /([A-Z]{3})([^\n\r]*)/g;
    const joined = lines.join("\n");
    let m: RegExpExecArray | null;
    while ((m = TAG.exec(joined))) {
      const key = m[1];
      const rest = m[2]?.trim() ?? "";
      elements[key] = elements[key] ? `${elements[key]} ${rest}`.trim() : rest;
    }
  
    return {
      raw,
      aamva: aamvaHeader || undefined,
      version,
      issuerIdentificationNumber: iinMatch ? iinMatch[1] : undefined,
      fileType: fileTypeMatch ? fileTypeMatch[1] : undefined,
      elements: { ...elements },
  
      CustomerIdNumber: elements["DAQ"],
      LastName: elements["DCS"],
      FirstName: elements["DAC"],
      MiddleName: elements["DAD"],
      Suffix: elements["DAF"] || elements["DCU"],
  
      Street1: elements["DAG"],
      Street2: elements["DAH"],
      City: elements["DAI"],
      State: elements["DAJ"],
      PostalCode: normalizeZip(elements["DAK"]),
  
      DateOfBirth: normalizeDate(elements["DBB"]),
      IssueDate: normalizeDate(elements["DBD"]),
      ExpirationDate: normalizeDate(elements["DBA"]),
  
      Sex: normalizeSex(elements["DBC"]),
      EyeColor: elements["DAY"],
      Height: elements["DAU"],
  
      LicenseClass: elements["DCA"] || elements["DAR"],
      Restrictions: elements["DCB"] || elements["DAS"],
      Endorsements: elements["DCD"] || elements["DAT"],
    };
  }
  
  export async function decodePdf417(bytes: Buffer): Promise<string[]> {
    try {
      // Use barcode-detector for PDF417 decoding
      // Note: This is a browser-compatible approach that works in Node.js with canvas
      const { BarcodeDetector } = await import("barcode-detector");
      
      // Convert Buffer to ImageData using canvas
      const { createCanvas, loadImage } = await import("canvas");
      
      // Load image from buffer
      const image = await loadImage(bytes);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Create a compatible ImageData object for BarcodeDetector
      const compatibleImageData = {
        data: imageData.data,
        width: imageData.width,
        height: imageData.height,
        colorSpace: 'srgb' as const
      };
      
      // Create BarcodeDetector instance for PDF417
      const detector = new BarcodeDetector({ formats: ["pdf417"] });
      
      // Detect barcodes
      const results = await detector.detect(compatibleImageData as any);
      
      if (!results?.length) return [];
      
      // Return array of decoded strings
      return results
        .map((r: any) => (typeof r.rawValue === "string" ? r.rawValue : ""))
        .filter(Boolean);
    } catch (err) {
      // Fallback: return empty array for now
      // TODO: Implement proper PDF417 decoding with a more compatible library
      console.warn("PDF417 detection failed:", (err as Error).message);
      console.warn("This is a placeholder implementation. PDF417 decoding needs proper setup.");
      return [];
    }
  }
  