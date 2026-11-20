import { z } from 'zod';
import { DOC_KINDS, DOC_TYPES, IMAGE_TYPES, type SubmitApplication, type UpdateProfile } from './types';
import { compactDigits, ibanElectronic, isCrNumber, isSaudiIban, isVatNumber, lengthOk } from './validators';

// The API's rules (SubmitVendorApplicationDto, UpdateVendorProfileDto), checked at our route before the call; the API
// checks them again. Constraint names follow the API's where the page maps them to a field.
const text = (min: number, max: number) => z.string().refine((s) => lengthOk(s, min, max), 'length').transform((s) => s.trim());
const description = z.object({ ar: z.string().max(1000).nullish(), en: z.string().max(1000).nullish() });
const geo = z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) });

export const SubmitSchema = z.object({
  name: z.object({ ar: text(2, 100), en: text(2, 100) }),
  description: description.optional(),
  commercialRegistrationNumber: z.string().refine(isCrNumber, 'matches').transform(compactDigits),
  vatNumber: z.string().refine(isVatNumber, 'matches').transform(compactDigits).optional(),
  city: text(2, 50),
  iban: z.string().refine(isSaudiIban, 'isSaudiIban').transform(ibanElectronic),
  accountHolderName: text(2, 100),
  location: geo,
  documents: z.array(z.object({ kind: z.enum(DOC_KINDS), mediaId: z.string().uuid() })).min(3).max(10),
}) satisfies z.ZodType<SubmitApplication, unknown>;

const saudiPhone = z.string().regex(/^\+966(5\d{8}|1[1-467]\d{7})$/, 'isSaudiPhoneNumber');
export const UpdateProfileSchema = z.object({
  logoMediaId: z.string().uuid().nullable().optional(),
  coverMediaId: z.string().uuid().nullable().optional(),
  contactPhone: saudiPhone.nullable().optional(),
  contactEmail: z.string().max(254).email('isEmail').nullable().optional(),
  vatNumber: z.string().refine(isVatNumber, 'matches').transform(compactDigits).nullable().optional(),
  description: description.optional(),
}) satisfies z.ZodType<UpdateProfile, unknown>;

const fileName = z.string().max(255).optional();
export const DocumentUploadSchema = z.object({ contentType: z.enum(DOC_TYPES as [string, ...string[]]), fileName });
export const ImageUploadSchema = z.object({
  purpose: z.enum(['vendor.logo', 'vendor.cover', 'catalog.product-image']),
  contentType: z.enum(IMAGE_TYPES as [string, ...string[]]),
  fileName,
});
