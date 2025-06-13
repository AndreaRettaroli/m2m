// message.ts
export interface Message {
  messageId: string;
  sender: string;
  recipient: string;
  payload: string;
  replyTo?: string;
}
