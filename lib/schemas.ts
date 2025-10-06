// lib/schemas.ts
import { z } from "zod";
import type { AAMVAFields } from "./pdf417";

export const DriversLicenseSchema = z.object({
  jurisdiction: z.string().default(""),
  idNumber: z.string().default(""),
  firstName: z.string().default(""),
  middleName: z.string().optional(),
  lastName: z.string().default(""),
  address1: z.string().default(""),
  address2: z.string().optional(),
  city: z.string().default(""),
  state: z.string().default(""),
  postalCode: z.string().default(""),
  dob: z.string().default(""),       // YYYY-MM-DD
  issuedOn: z.string().optional(),   // YYYY-MM-DD
  expiresOn: z.string().optional(),  // YYYY-MM-DD
  class: z.string().optional(),
  restrictions: z.string().optional(),
  endorsements: z.string().optional(),
  sex: z.string().optional(),
  eyeColor: z.string().optional(),
  height: z.string().optional(),
  rawSource: z.enum(["pdf417", "ocr+llm"]),
  rawText: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.98),
});
export type DriversLicense = z.infer<typeof DriversLicenseSchema>;

export function mapAAMVAtoDL(a: AAMVAFields): DriversLicense {
  const jurisdiction =
    a.State ||
    a.issuerIdentificationNumber ||
    "";

  const dl: DriversLicense = {
    jurisdiction: jurisdiction,
    idNumber: a.CustomerIdNumber || "",
    firstName: a.FirstName || "",
    middleName: a.MiddleName || undefined,
    lastName: a.LastName || "",
    address1: a.Street1 || "",
    address2: a.Street2 || undefined,
    city: a.City || "",
    state: a.State || "",
    postalCode: a.PostalCode || "",
    dob: a.DateOfBirth || "",
    issuedOn: a.IssueDate || undefined,
    expiresOn: a.ExpirationDate || undefined,
    class: a.LicenseClass || undefined,
    restrictions: a.Restrictions || undefined,
    endorsements: a.Endorsements || undefined,
    sex: a.Sex || undefined,
    eyeColor: a.EyeColor || undefined,
    height: a.Height || undefined,
    rawSource: "pdf417",
    rawText: a.raw,
    confidence: 0.98,
  };

  // Validate and coerce defaults
  return DriversLicenseSchema.parse(dl);
}
