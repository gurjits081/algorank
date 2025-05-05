import Router from 'express';
import {
  createProblem,
  deleteProblem,
  getAllProblems,
  getAllProblemsSolvedbyUser,
  getProblemById,
} from '../controllers/problem.controllers.js';
import { authMiddleware, checkAdmin } from '../middlewares/auth.middleware.js';

const problemRoutes = Router();

problemRoutes.route('/create-problem').post(authMiddleware, checkAdmin, createProblem);
problemRoutes.route('/get-all-problems').get(authMiddleware, getAllProblems);
problemRoutes.route('/get-problem/:id').get(authMiddleware, getProblemById);
problemRoutes.route('/delete-problem/:id').delete(authMiddleware, checkAdmin, deleteProblem);
problemRoutes.route('/get-solved-problems').get(authMiddleware, getAllProblemsSolvedbyUser);

export default problemRoutes;
