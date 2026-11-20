import { z } from 'zod';
import { COLOR_RE, type CreateZone, type UpdateZone } from './types';

// The API's own limits (CreateCoverageZoneDto), checked at our route before the call; the API checks them again.
const position = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
const polygon = z.object({ type: z.literal('Polygon'), coordinates: z.array(z.array(position).min(4).max(1000)).min(1) });
const name = z.object({ ar: z.string().trim().min(2).max(100), en: z.string().trim().min(2).max(100) });
const city = z.string().trim().min(2).max(50);
const color = z.string().regex(COLOR_RE);

// The editor always sends isActive and color, so the API defaults never apply here.
export const CreateZoneSchema = z.object({ name, city, polygon, isActive: z.boolean(), color }) satisfies z.ZodType<CreateZone>;
export const UpdateZoneSchema = CreateZoneSchema.partial() satisfies z.ZodType<UpdateZone>;

export { invalidBody, langOf } from '@/lib/route';
