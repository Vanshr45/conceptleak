/**
 * Prisma-backed user store.
 * Passwords are hashed with bcryptjs before storage.
 */
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuthType = "email" | "google";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string; // undefined for Google-only accounts
  authType: AuthType;
  picture?: string;      // Google avatar URL
  createdAt: string;
}

function toStoredUser(user: User): StoredUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash ?? undefined,
    authType: user.authType as AuthType,
    picture: user.picture ?? undefined,
    createdAt: user.createdAt.toISOString(),
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<StoredUser | undefined> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user ? toStoredUser(user) : undefined;
  } catch (error) {
    console.error("Failed to find user by email:", error);
    return undefined;
  }
}

export async function getUserById(id: string): Promise<StoredUser | undefined> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toStoredUser(user) : undefined;
  } catch (error) {
    console.error("Failed to find user by id:", error);
    return undefined;
  }
}

/**
 * Attempt email/password login.
 * - If the email doesn't exist → auto-register with the given password.
 * - If the email exists → verify hash.
 * Returns the user on success, null on bad password.
 */
export async function loginOrRegister(
  email: string,
  password: string,
  nameHint?: string
): Promise<StoredUser | null> {
  try {
    const normalizedEmail = email.toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (!existing.passwordHash) {
        return null;
      }

      const ok = await bcrypt.compare(password, existing.passwordHash);
      return ok ? toStoredUser(existing) : null;
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        id: `user-${Date.now()}`,
        name: nameHint || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        passwordHash: hash,
        authType: "email",
      },
    });

    return toStoredUser(newUser);
  } catch (error) {
    console.error("Failed to login or register user:", error);
    return null;
  }
}

/**
 * Find-or-create a user from a Google OAuth profile.
 * Never sets a passwordHash — these accounts are Google-only.
 */
export async function upsertGoogleUser(profile: {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}): Promise<StoredUser | null> {
  try {
    const normalizedEmail = profile.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          authType: "google",
          picture: profile.picture ?? user.picture,
          name: user.name || profile.name,
          email: normalizedEmail,
        },
      });
      return toStoredUser(updated);
    }

    const created = await prisma.user.upsert({
      where: { id: `user-g-${profile.sub}` },
      update: {
        name: profile.name,
        email: normalizedEmail,
        authType: "google",
        picture: profile.picture,
      },
      create: {
        id: `user-g-${profile.sub}`,
        name: profile.name,
        email: normalizedEmail,
        authType: "google",
        picture: profile.picture,
      },
    });

    return toStoredUser(created);
  } catch (error) {
    console.error("Failed to upsert Google user:", error);
    return null;
  }
}
