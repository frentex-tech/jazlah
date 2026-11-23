import { ApiProperty } from '@nestjs/swagger';

/** Whether new orders are paused, and the message customers see while they are. */
export class OrderingPauseResponseDto {
  @ApiProperty({
    example: false,
    description:
      'While true, every cart change and checkout call answers ORDERING_PAUSED with these messages.',
  })
  isPaused!: boolean;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'نعتذر، الطلبات متوقفة مؤقتًا',
    description: 'The message in Arabic; null when not paused.',
  })
  messageAr!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'Ordering is paused for now.',
    description: 'The message in English; null when not paused.',
  })
  messageEn!: string | null;
}
