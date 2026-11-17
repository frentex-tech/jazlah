import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { getMetadataStorage, ValidationTypes } from 'class-validator';

/**
 * Every request DTO under `src/`, walked at run time: a property validated with
 * `@ValidateNested()` must say whether it may be missing. class-validator skips
 * nested validation when the value is undefined, so without `@IsDefined()` a
 * required nested object that is left out reaches the controller and fails there
 * (500 instead of VALIDATION_FAILED). An optional one says so with `@IsOptional()`,
 * or with `@ValidateIf()` when it is optional but never null: class-validator
 * implements `@IsOptional()` as a conditional validation too.
 */
const SRC = join(__dirname, '..', '..');

function dtoFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'generated' ? [] : dtoFiles(path);
    }
    return entry.name.endsWith('.dto.ts') ? [path] : [];
  });
}

type NestedProperty = Readonly<{
  where: string;
  presenceDecided: boolean;
}>;

function nestedProperties(): NestedProperty[] {
  const storage = getMetadataStorage();
  return dtoFiles(SRC).flatMap((file) => {
    const exports = jest.requireActual<Record<string, unknown>>(file);
    return Object.entries(exports).flatMap(([name, value]) => {
      if (typeof value !== 'function') {
        return [];
      }
      const metadatas = storage.getTargetValidationMetadatas(
        value,
        '',
        false,
        false,
      );
      const nested = new Set(
        metadatas
          .filter((m) => m.type === ValidationTypes.NESTED_VALIDATION)
          .map((m) => m.propertyName),
      );
      return [...nested].map((property) => ({
        where: `${relative(SRC, file).replaceAll('\\', '/')}: ${name}.${property}`,
        presenceDecided: metadatas.some(
          (m) =>
            m.propertyName === property &&
            (m.type === ValidationTypes.IS_DEFINED ||
              m.type === ValidationTypes.CONDITIONAL_VALIDATION),
        ),
      }));
    });
  });
}

describe('request DTOs: nested properties', () => {
  const properties = nestedProperties();

  it('finds the nested properties of the request DTOs', () => {
    expect(properties.map((p) => p.where)).toEqual(
      expect.arrayContaining([
        'modules/customers/dto/create-customer-address.dto.ts: CreateCustomerAddressDto.location',
        'modules/vendors/api/dto/submit-vendor-application.dto.ts: SubmitVendorApplicationDto.location',
      ]),
    );
  });

  it('gives each one @IsDefined() or @IsOptional()', () => {
    expect(
      properties.filter((p) => !p.presenceDecided).map((p) => p.where),
    ).toEqual([]);
  });
});
