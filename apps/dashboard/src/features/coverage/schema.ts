import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Result } from './backend';
import { CITIES, ZONE_COLORS } from './types';

const position = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

/** Body of create and update, validated at the route handler before it reaches the API. */
export const ZoneInputSchema = z.object({
  nameAr: z.string().trim().min(1).max(80),
  nameEn: z.string().trim().min(1).max(80),
  city: z.enum(CITIES),
  color: z.enum(ZONE_COLORS as [string, ...string[]]),
  isActive: z.boolean(),
  polygon: z.object({ type: z.literal('Polygon'), coordinates: z.array(z.array(position).min(4).max(500)).length(1) }),
});

export function respond<T>(r: Result<T>, okStatus = 200) {
  return r.ok ? NextResponse.json(r.data, { status: okStatus }) : NextResponse.json({ code: r.code }, { status: r.status });
}
