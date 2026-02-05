
export interface INotificationService {
  sendWhatsAppMessage(to: string, message: string): Promise<void>;
}
