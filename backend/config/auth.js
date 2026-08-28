const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured and contain at least 32 characters');
}

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRE });
};

const verifyToken = (token, options = {}) => {
  try {
    return jwt.verify(token, JWT_SECRET, options);
  } catch (error) {
    return null;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, generateRefreshToken, verifyToken, decodeToken, JWT_SECRET };
