import { inflateSync } from 'node:zlib';
import { detectContentType } from '@common/files/detect-content-type';
import { encodeSolidPng } from './encode-solid-png';

describe('encodeSolidPng', () => {
  it('is detected as a PNG, as MediaService checks an upload', () => {
    expect(detectContentType(encodeSolidPng(4, 3, '#a0522d'))).toBe(
      'image/png',
    );
  });

  it('writes the size in the header and the colour in every pixel', () => {
    const png = encodeSolidPng(4, 3, '#A0522D');
    expect(png.readUInt32BE(16)).toBe(4);
    expect(png.readUInt32BE(20)).toBe(3);
    const dataLength = png.readUInt32BE(33);
    const pixels = inflateSync(png.subarray(41, 41 + dataLength));
    expect(pixels).toHaveLength(3 * (1 + 4 * 3));
    expect([...pixels.subarray(1, 4)]).toEqual([0xa0, 0x52, 0x2d]);
  });

  it('gives the same bytes for the same arguments', () => {
    expect(encodeSolidPng(8, 8, '#123456')).toEqual(
      encodeSolidPng(8, 8, '#123456'),
    );
  });

  it('refuses a colour that is not #RRGGBB', () => {
    expect(() => encodeSolidPng(4, 4, 'red')).toThrow(RangeError);
  });
});
