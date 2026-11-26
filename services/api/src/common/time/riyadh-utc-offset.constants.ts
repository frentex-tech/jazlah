/**
 * Riyadh's offset from UTC, in milliseconds: UTC+3 all year.
 *
 * ASSUMPTION (backend owner, 2026-11-26): Saudi Arabia keeps Arabia Standard Time, UTC+3,
 * with no daylight saving time, so a fixed offset gives the same answers as the
 * `Asia/Riyadh` zone and needs no time zone database or package. If the kingdom ever
 * adopts daylight saving time, this constant and `RiyadhCalendar` are the only places
 * to change.
 */
export const RIYADH_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;
