import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setAuthCookie } from "@/lib/auth";
import { loginOrRegister } from "@/lib/users";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await loginOrRegister(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Incorrect password for this account." },
        { status: 401 }
      );
    }

    await setAuthCookie({
      sub: user.id,
      name: user.name,
      email: user.email,
      authType: user.authType,
      picture: user.picture,
    });

    return NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email, authType: user.authType },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
