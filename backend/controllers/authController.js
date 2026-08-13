import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const publicUser = (user) => ({
  id: user.id,
  username: user.username,
  role: user.role,
  baseId: user.baseId,
  base: user.base ? { id: user.base.id, name: user.base.name } : null
});

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });

    const user = await prisma.user.findUnique({ where: { username }, include: { base: true } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, baseId: user.baseId },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({ token, user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { base: true } });
    if (!user) return res.status(404).json({ message: 'User no longer exists.' });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}
