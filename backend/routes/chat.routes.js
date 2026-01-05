import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import {
    createNewChat,
    getChatHistory,
    getChatMessages,
    sendMessage,
    deleteChat
} from '../controllers/chat.controller.js';

const router = express.Router();


router.use(authenticateUser);


router.post('/new', createNewChat);
router.get('/history', getChatHistory);
router.get('/:chatId/messages', getChatMessages);
router.post('/:chatId/message', sendMessage);
router.delete('/:chatId', deleteChat);

export default router;
