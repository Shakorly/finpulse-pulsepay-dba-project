import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET || 'change-me-in-production'

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' })
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET) } catch { return null }
}

export function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get('fp_token')?.value
  if (!token) return null
  return verifyToken(token)
}
