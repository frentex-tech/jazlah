/** Whether the admin paused new orders, with the messages customers see. */
export type OrderingPause = Readonly<{
  isPaused: boolean;
  messageAr: string | null;
  messageEn: string | null;
}>;
