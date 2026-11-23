import { crc32, deflateSync } from 'node:zlib';

/** The 8-byte signature every PNG starts with (PNG specification, 5.2). */
const PNG_SIGNATURE = Uint8Array.of(
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a,
);

/** A colour as `#RRGGBB`. */
const HEX_COLOR = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

/**
 * A PNG image of one solid colour (`#RRGGBB`), made in memory: the placeholder the
 * seed uploads for product images, vendor logos and facility photos. 8-bit truecolour,
 * no interlace (PNG specification, 11.2.2); a solid image compresses to a few hundred
 * bytes. The same arguments always give the same bytes.
 */
export function encodeSolidPng(
  width: number,
  height: number,
  color: string,
): Buffer {
  const match = HEX_COLOR.exec(color);
  if (match === null || !Number.isInteger(width) || !Number.isInteger(height)) {
    throw new RangeError(`not a solid PNG: ${width}x${height} ${color}`);
  }
  const pixel = match.slice(1, 4).map((part) => Number.parseInt(part, 16));
  const row = Buffer.alloc(1 + width * 3);
  // Filter type 0 (none), then the pixels.
  for (let x = 0; x < width; x += 1) {
    row.set(pixel, 1 + x * 3);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  // Bit depth 8, colour type 2 (truecolour), compression 0, filter 0, interlace 0.
  header.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([
    PNG_SIGNATURE,
    chunk('IHDR', header),
    chunk(
      'IDAT',
      deflateSync(Buffer.concat(Array.from({ length: height }, () => row))),
    ),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** A PNG chunk: length, type, data, and the CRC of type and data (PNG specification, 5.3). */
function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typed = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(typed), 0);
  return Buffer.concat([length, typed, checksum]);
}
