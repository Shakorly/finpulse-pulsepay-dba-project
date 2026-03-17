import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
const SECRET = process.env.JWT_SECRET || 'pulsepay-secret'
export const signToken = (p) => jwt.sign(p, SECRET, { expiresIn: '8h' })
export const verifyToken = (t) => { try { return jwt.verify(t, SECRET) } catch { return null } }
export function getSession() {
  const t = cookies().get('pp_token')?.value
  return t ? verifyToken(t) : null
}
