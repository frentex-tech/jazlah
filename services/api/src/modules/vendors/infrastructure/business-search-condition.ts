import { escapeLikePattern } from '@common/text/escape-like-pattern';
import { toLatinDigits } from '@common/text/to-latin-digits';

/**
 * The Prisma condition of an admin's search over vendors or applications (both have these
 * columns): `q` contained, case-insensitively, in the Arabic or English store name, or in
 * the commercial registration number with Arabic digits read as Latin. `%`, `_` and `\`
 * in `q` are taken literally (escapeLikePattern); Prisma's `contains` does not escape them.
 * No index serves it: the admin lists are small next to orders (DECISIONS.md, "Vendors").
 */
export function businessSearchCondition(q: string) {
  const text = escapeLikePattern(q);
  // Under AND, so it never meets the OR of keysetAfter spread into the same condition.
  return {
    AND: {
      OR: [
        { nameAr: { contains: text, mode: 'insensitive' as const } },
        { nameEn: { contains: text, mode: 'insensitive' as const } },
        {
          commercialRegistrationNumber: {
            contains: escapeLikePattern(toLatinDigits(q)),
          },
        },
      ],
    },
  };
}
