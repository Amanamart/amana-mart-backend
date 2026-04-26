import { Request, Response } from 'express';
import { prisma } from '../common/lib/prisma';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'amana_whatsapp_verify_2026';

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }
  return res.status(403).json({ message: 'Forbidden' });
};

export const handleInbound = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body.object !== 'whatsapp_business_account') {
      return res.status(400).json({ message: 'Invalid object' });
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      return res.sendStatus(200);
    }

    for (const msg of messages) {
      const phone = msg.from;
      const waMessageId = msg.id;
      const messageType = msg.type || 'text';
      const body_text = msg.text?.body || msg.caption || '[media]';

      // Find or create session
      let session = await prisma.whatsAppSession.findUnique({ where: { phone } });
      if (!session) {
        // Try to find customer by phone
        const customer = await prisma.user.findFirst({ where: { phone } });
        session = await prisma.whatsAppSession.create({
          data: {
            phone,
            customerId: customer?.id,
            state: 'idle',
          },
        });
      } else {
        await prisma.whatsAppSession.update({
          where: { id: session.id },
          data: { lastActivity: new Date() },
        });
      }

      // Save message
      await prisma.whatsAppMessage.create({
        data: {
          sessionId: session.id,
          direction: 'inbound',
          body: body_text,
          messageType,
          waMessageId,
          status: 'received',
        },
      });

      // Process with State Machine
      const { processWhatsAppMessage } = require('./service');
      const response = await processWhatsAppMessage(phone, body_text);

      console.log(`📱 WhatsApp inbound [${phone}]: ${body_text}`);
      console.log(`🤖 WhatsApp response [${phone}]: ${response}`);

      // NOTE: In a real production app, we would call the WhatsApp Business API 
      // here to actually SEND the 'response' text back to the user.
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error('WhatsApp webhook error:', error.message);
    res.sendStatus(200); // Always 200 to avoid WhatsApp retries
  }
};


