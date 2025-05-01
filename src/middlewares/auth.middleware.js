import jwt from 'jsonwebtoken';
import { db } from '../libs/db.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Authorization failed, Please login.' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.user.findUnique({
      where: {
        id: decodedToken.id,
      },
      select: {
        id: true,
        email: true,
        image: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Error authenticating user: ', error);
    res.status(500).json({ message: 'Error authenticating user' });
  }
};
