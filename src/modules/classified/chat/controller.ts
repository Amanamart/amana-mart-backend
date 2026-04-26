import { Request, Response } from 'express';
import chatService from './service';

export const chatController = {
  async getConversations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const convs = await chatService.getConversations(userId);
      res.json(convs);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async startConversation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const conv = await chatService.startConversation(req.params.adId, userId);
      res.status(201).json(conv);
    } catch (err: any) { res.status(400).json({ message: err.message }); }
  },
  async getMessages(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const msgs = await chatService.getMessages(req.params.conversationId, userId);
      res.json(msgs);
    } catch (err: any) { res.status(400).json({ message: err.message }); }
  },
  async sendMessage(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { body, messageType, imageUrl } = req.body;
      const msg = await chatService.sendMessage(req.params.conversationId, userId, body, messageType, imageUrl);
      res.status(201).json(msg);
    } catch (err: any) { res.status(400).json({ message: err.message }); }
  },
  async adminGetReportedChats(_req: Request, res: Response) {
    try {
      const chats = await chatService.adminGetReportedChats();
      res.json(chats);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async adminBlockConversation(req: Request, res: Response) {
    try {
      const conv = await chatService.adminBlockConversation(req.params.id);
      res.json(conv);
    } catch (err: any) { res.status(400).json({ message: err.message }); }
  },
};

export default chatController;
