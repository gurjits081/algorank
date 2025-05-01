import Router from 'express';
import { register, login, logout, check } from '../controllers/user.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(authMiddleware, logout);
router.route('/check').get(authMiddleware, check);

export default router;
