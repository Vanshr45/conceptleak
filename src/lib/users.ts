/**
 * Lightweight JSON-file user store.
 * Reads/writes data/users.json on every operation — no external DB needed.
 * Passwords are hashed with bcryptjs before storage.
 */
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

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

// ── File helpers ────────────────────────────────────────────────────────────

let fallbackMemoryUsers: StoredUser[] | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // Read-only filesystem (e.g. Vercel)
  }
}

function readUsers(): StoredUser[] {
  if (fallbackMemoryUsers) return fallbackMemoryUsers;

  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    // Seed demo account on first run (synchronous bcrypt for init only)
    const hash = bcrypt.hashSync("demo123", 10);
    const demo: StoredUser[] = [
      {
        id: "user-demo",
        name: "Vansh",
        email: "demo@conceptleak.ai",
        passwordHash: hash,
        authType: "email",
        createdAt: new Date("2024-01-01").toISOString(),
      },
    ];
    
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(demo, null, 2));
    } catch {
      fallbackMemoryUsers = demo;
    }
    
    return demo;
  }
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8")) as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  fallbackMemoryUsers = users;
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.warn("Failed to write to file system, using in-memory fallback.");
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export function getUserByEmail(email: string): StoredUser | undefined {
  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): StoredUser | undefined {
  const users = readUsers();
  return users.find((u) => u.id === id);
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
  const users = readUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    // Existing account — must have a password hash (not Google-only)
    if (!existing.passwordHash) {
      // Google account — can't log in with password
      return null;
    }
    const ok = await bcrypt.compare(password, existing.passwordHash);
    return ok ? existing : null;
  }

  // New account — register automatically
  const hash = await bcrypt.hash(password, 10);
  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name: nameHint || email.split("@")[0],
    email: email.toLowerCase(),
    passwordHash: hash,
    authType: "email",
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeUsers(users);
  return newUser;
}

/**
 * Find-or-create a user from a Google OAuth profile.
 * Never sets a passwordHash — these accounts are Google-only.
 */
export function upsertGoogleUser(profile: {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}): StoredUser {
  const users = readUsers();
  const existing = users.find(
    (u) => u.email.toLowerCase() === profile.email.toLowerCase()
  );

  if (existing) {
    // Upgrade to Google auth if they previously signed up with email
    existing.authType = "google";
    existing.picture = profile.picture ?? existing.picture;
    existing.name = existing.name || profile.name;
    writeUsers(users);
    return existing;
  }

  const newUser: StoredUser = {
    id: `user-g-${profile.sub}`,
    name: profile.name,
    email: profile.email.toLowerCase(),
    authType: "google",
    picture: profile.picture,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeUsers(users);
  return newUser;
}
