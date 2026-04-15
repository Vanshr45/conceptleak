import { NextRequest, NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth";
import { upsertGoogleUser } from "@/lib/users";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  error?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_denied`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/login?error=google_not_configured`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = (await tokenRes.json()) as GoogleTokenResponse;
    if (tokens.error || !tokens.access_token) {
      return NextResponse.redirect(`${appUrl}/login?error=google_token_failed`);
    }

    // Fetch user profile
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = (await profileRes.json()) as GoogleUserInfo;

    if (!profile.email) {
      return NextResponse.redirect(`${appUrl}/login?error=google_no_email`);
    }

    // Find or create user
    const user = upsertGoogleUser({
      sub: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    // Set JWT cookie — same structure as email/password login
    await setAuthCookie({
      sub: user.id,
      name: user.name,
      email: user.email,
      authType: "google",
      picture: user.picture,
    });

    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch {
    return NextResponse.redirect(`${appUrl}/login?error=google_failed`);
  }
}
