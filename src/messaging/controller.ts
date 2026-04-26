import { Response } from 'express';
import * as MessagingService from './service';
import { AuthRequest } from '../common/middleware/auth';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await MessagingService.getConversations(req.user!.id);
    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, memberIds } = req.body;
    const allMemberIds = [...new Set([req.user!.id, ...(memberIds || [])])];
    const conversation = await MessagingService.createConversation({ title, type, memberIds: allMemberIds });
    res.status(201).json(conversation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const messages = await MessagingService.getMessages(req.params.id as string, page, limit);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const message = await MessagingService.sendMessage({
      conversationId: req.params.id as string,
      senderId: req.user!.id,
      body: req.body.body,
      type: req.body.type,
    });
    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markRead = async (req: AuthRequest, res: Response) => {
  try {
    await MessagingService.markMessageRead(req.params.id as string, req.user!.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await MessagingService.getUnreadCount(req.user!.id);
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};





