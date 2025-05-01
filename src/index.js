import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import router from './routers/user.routes.js';
import problemRoutes from './routers/problem.routes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

app.use('/api/v1/user', router);
app.use('/api/v1/problem', problemRoutes);
