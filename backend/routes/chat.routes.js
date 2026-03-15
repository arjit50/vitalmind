import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import {
    createNewChat,
    getChatHistory,
    getChatMessages,
    sendMessage,
    deleteChat
} from '../controllers/chat.controller.js';
import { uploadMedicineImage } from '../controllers/imageUpload.controller.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();


router.use(authenticateUser);


router.post('/new', createNewChat);
router.get('/history', getChatHistory);
router.get('/:chatId/messages', getChatMessages);
router.post('/:chatId/message', sendMessage);
router.post('/:chatId/image', upload.single('image'), uploadMedicineImage);
router.delete('/:chatId', deleteChat);

export default router;
