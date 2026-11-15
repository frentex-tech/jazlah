import type { UploadTicketResponseDto } from './dto/upload-ticket-response.dto';
import type { UploadTicket } from './upload-ticket.type';

/** An upload ticket as the response of an upload request. */
export function toUploadTicketResponse(
  ticket: UploadTicket,
): UploadTicketResponseDto {
  return {
    mediaId: ticket.mediaId,
    url: ticket.url,
    fields: { ...ticket.fields },
    expiresAt: ticket.expiresAt,
    confirmBy: ticket.confirmBy,
  };
}
