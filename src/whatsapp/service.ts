import { prisma } from '../common/lib/prisma';

export const processWhatsAppMessage = async (phone: string, text: string) => {
  const normalizedText = text.toLowerCase().trim();

  // 1. Get or create session
  let session = await prisma.whatsAppSession.findUnique({
    where: { phone },
    include: { customer: true }
  });

  if (!session) {
    const customer = await prisma.user.findFirst({ where: { phone } });
    session = await prisma.whatsAppSession.create({
      data: { phone, customerId: customer?.id, state: 'idle' },
      include: { customer: true }
    });
  }

  let responseText = '';
  let newState = session.state;

  // 2. State Machine
  switch (session.state) {
    case 'idle':
      if (normalizedText.includes('order') || normalizedText.includes('start')) {
        responseText = 'Welcome to Amana Mart Ordering! 🛒\nWhat would you like to buy? Please list items (e.g. 2kg Rice, 1L Oil).';
        newState = 'ordering';
      } else {
        responseText = 'Hello! Welcome to Amana Mart. 👋\nSend "order" to start a new order via WhatsApp.';
      }
      break;

    case 'ordering':
      // Store current order items in metadata or a temp field (if schema allows)
      // For now, we'll just assume they sent the items
      responseText = `Got it! You want: ${text}\n\nPlease send your delivery address. 📍`;
      newState = 'address';
      break;

    case 'address':
      responseText = `Perfect! We will deliver to: ${text}\n\nConfirm order for "${session.phone}"? (Send YES to confirm or NO to cancel)`;
      newState = 'confirm';
      break;

    case 'confirm':
      if (normalizedText === 'yes') {
        // Create an actual order in the DB
        await prisma.order.create({
          data: {
            orderNumber: `WA-${Math.floor(1000 + Math.random() * 9000)}`,
            totalAmount: 0,
            status: 'pending',
            paymentStatus: 'unpaid',
            source: 'whatsapp',
            deliveryAddress: 'WhatsApp Provided',
            customerId: session.customerId || '',
            storeId: 'default', // Would be set based on chosen store
          }
        });
        responseText = '✅ Your order has been placed successfully! Our agent will contact you shortly for payment and total amount. Thank you for shopping with Amana Mart!';
        newState = 'idle';
      } else {
        responseText = 'Order cancelled. Send "order" whenever you are ready again.';
        newState = 'idle';
      }
      break;

    default:
      newState = 'idle';
      responseText = 'Something went wrong. Let\'s start over. Send "order".';
  }

  // 3. Update session
  await prisma.whatsAppSession.update({
    where: { id: session.id },
    data: { state: newState, lastActivity: new Date() }
  });

  return responseText;
};
