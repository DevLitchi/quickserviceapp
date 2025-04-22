import * as bcrypt from "bcryptjs"

// Compare a password with a hash
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Error comparing passwords:", error)
    return false
  }
}
