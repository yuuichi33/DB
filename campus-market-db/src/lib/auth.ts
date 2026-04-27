import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import type { NextResponse } from "next/server";

const HASH_SCHEME = "sha256";
const SESSION_VERSION = "v1";
const SESSION_COOKIE_NAME = "campus_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("未检测到 AUTH_SECRET，请先在环境变量中配置会话密钥。");
  }
  return secret;
}

function hashWithSalt(password: string, salt: string) {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function hashPassword(password: string, salt?: string) {
  const effectiveSalt = salt ?? randomBytes(12).toString("hex");
  const digest = hashWithSalt(password, effectiveSalt);
  return `${HASH_SCHEME}$${effectiveSalt}$${digest}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, digest] = storedHash.split("$");
  if (!scheme || !salt || !digest || scheme !== HASH_SCHEME) {
    return false;
  }

  const expectedDigest = hashWithSalt(password, salt);
  return safeEqual(digest, expectedDigest);
}

function signSessionPayload(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${SESSION_VERSION}.${userId}.${expiresAt}`;
  const signature = signSessionPayload(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const [version, userId, expiresAtText, signature] = token.split(".");
  if (!version || !userId || !expiresAtText || !signature) {
    return null;
  }

  if (version !== SESSION_VERSION) {
    return null;
  }

  const payload = `${version}.${userId}.${expiresAtText}`;
  const expectedSignature = signSessionPayload(payload);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  const expiresAt = Number(expiresAtText);
  if (!Number.isInteger(expiresAt)) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (expiresAt <= now) {
    return null;
  }

  const session: SessionPayload = { userId, expiresAt };
  return session;
}

function getCookieValue(cookieHeader: string | null, key: string) {
  if (!cookieHeader) {
    return null;
  }

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [name, ...valueParts] = pair.trim().split("=");
    if (name === key) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export function getSessionUserIdFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const token = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);
  const session = verifySessionToken(token);
  return session?.userId ?? null;
}

export function setSessionCookie(response: NextResponse, userId: string) {
  const token = createSessionToken(userId);
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
