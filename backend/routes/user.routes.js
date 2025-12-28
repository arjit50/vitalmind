import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

export default router;
