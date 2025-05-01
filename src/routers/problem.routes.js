import Router from 'express';
import { createProblem } from '../controllers/problem.controllers.js';
import { authMiddleware, checkAdmin } from '../middlewares/auth.middleware.js';

const problemRoutes = Router();

problemRoutes.route('/create-problem').post(authMiddleware, checkAdmin, createProblem);

export default problemRoutes;
