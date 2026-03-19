import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// JWT_SECRET must be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set in environment variables!')
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function getAuthUser(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  return verifyToken(token)
}
