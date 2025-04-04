import "server-only"

import { genSaltSync, hashSync } from "bcrypt-ts"
import { desc, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { v4 as uuidv4 } from "uuid"

import { user, chat, type User, reservation } from "./schema"

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`)
const db = drizzle(client)

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email))
  } catch (error) {
    console.error("Failed to get user from database")
    throw error
  }
}

export async function getUserByResetToken(token: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.resetToken, token))
  } catch (error) {
    console.error("Failed to get user by reset token from database")
    throw error
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10)
  const hash = hashSync(password, salt)

  try {
    return await db.insert(user).values({ email, password: hash })
  } catch (error) {
    console.error("Failed to create user in database")
    throw error
  }
}

export async function createPasswordResetToken(email: string) {
  try {
    const resetToken = uuidv4()
    // Token expires in 1 hour
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    await db.update(user).set({ resetToken, resetTokenExpiry }).where(eq(user.email, email))

    return resetToken
  } catch (error) {
    console.error("Failed to create password reset token")
    throw error
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const users = await getUserByResetToken(token)

    if (users.length === 0) {
      throw new Error("Invalid or expired reset token")
    }

    const userToReset = users[0]

    // Check if token is expired
    if (!userToReset.resetTokenExpiry || new Date(userToReset.resetTokenExpiry) < new Date()) {
      throw new Error("Reset token has expired")
    }

    // Hash the new password
    const salt = genSaltSync(10)
    const hash = hashSync(newPassword, salt)

    // Update the user's password and clear the reset token
    await db
      .update(user)
      .set({
        password: hash,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(user.id, userToReset.id))

    return true
  } catch (error) {
    console.error("Failed to reset password")
    throw error
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string
  messages: any
  userId: string
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id))

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id))
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      userId,
    })
  } catch (error) {
    console.error("Failed to save chat in database")
    throw error
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id))
  } catch (error) {
    console.error("Failed to delete chat by id from database")
    throw error
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db.select().from(chat).where(eq(chat.userId, id)).orderBy(desc(chat.createdAt))
  } catch (error) {
    console.error("Failed to get chats by user from database")
    throw error
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id))
    return selectedChat
  } catch (error) {
    console.error("Failed to get chat by id from database")
    throw error
  }
}

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string
  userId: string
  details: any
}) {
  return await db.insert(reservation).values({
    id,
    createdAt: new Date(),
    userId,
    hasCompletedPayment: false,
    details: JSON.stringify(details),
  })
}

export async function getReservationById({ id }: { id: string }) {
  const [selectedReservation] = await db.select().from(reservation).where(eq(reservation.id, id))

  return selectedReservation
}

export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string
  hasCompletedPayment: boolean
}) {
  return await db
    .update(reservation)
    .set({
      hasCompletedPayment,
    })
    .where(eq(reservation.id, id))
}

