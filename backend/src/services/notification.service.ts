import { DrizzleDb } from '../db/connection';
import { notifications } from '../db/schema';

export interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'booking_update' | 'owner_request' | 'admin_alert' | 'payment_success';
  metadata?: Record<string, any>;
}

export async function createNotification(
  db: DrizzleDb,
  params: SendNotificationParams
) {
  const notifId = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(notifications).values({
    id: notifId,
    userId: params.userId,
    title: params.title,
    message: params.message,
    type: params.type,
    isRead: false,
    metadataJson: JSON.stringify(params.metadata || {}),
    createdAt: now,
  });

  // Simulated Email / WhatsApp integration hook
  console.log(`[NOTIFICATION DISPATCH] Type: ${params.type} | User: ${params.userId} | "${params.title}" - ${params.message}`);

  return notifId;
}
