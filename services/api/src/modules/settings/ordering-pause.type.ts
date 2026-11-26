/** Whether new orders are paused; the messages are null exactly when not paused. */
export type OrderingPause = Readonly<{
  isPaused: boolean;
  messageAr: string | null;
  messageEn: string | null;
}>;
