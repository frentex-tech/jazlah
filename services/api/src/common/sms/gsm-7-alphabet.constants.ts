// The GSM 7-bit default alphabet, 3GPP TS 23.038, section 6.2.1, in table order (codes
// 0x00 to 0x7F), without 0x1B, the escape to the extension table.

/** The 127 characters of the basic table: one septet each. */
export const GSM_7_BASIC_CHARACTERS =
  '@£$¥èéùìòÇ\nØø\rÅå' +
  'Δ_ΦΓΛΩΠΨΣΘΞÆæßÉ' +
  ' !"#¤%&\'()*+,-./' +
  '0123456789:;<=>?' +
  '¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§' +
  '¿abcdefghijklmnopqrstuvwxyzäöñüà';

/** The characters of the default extension table: two septets each (escape + code). */
export const GSM_7_EXTENSION_CHARACTERS = '\f^{}\\[~]|€';
