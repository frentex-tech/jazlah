/**
 * The colours of the placeholder product images, by meat type key (`mixed` for a
 * product with none): image n of a product takes colour n of its palette, so the
 * images of one product differ and every run draws the same ones.
 */
export const IMAGE_PALETTES: Readonly<Record<string, readonly string[]>> = {
  naimi: ['#C0504D', '#D9776F', '#A33F3B'],
  harri: ['#B5652E', '#CF8A57', '#8E4C21'],
  sawakni: ['#9C3D54', '#BD6378', '#7A2E41'],
  'local-goat': ['#8A5A44', '#A97C66', '#6B4433'],
  camel: ['#A0522D', '#C27A55', '#7E3F22'],
  veal: ['#B03A2E', '#CC6155', '#8C2D23'],
  mixed: ['#944D4D', '#B37272', '#733B3B'],
};
