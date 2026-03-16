import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

export async function GET() {
  try {
    await sendMail({
      to: process.env.SMTP_USER,
      subject: "Test email - Lovci VIP",
      html: `
        <h1>Test email funguje</h1>
        <p>Pokud čteš tento e-mail, odesílání z aplikace je funkční.</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("TEST EMAIL ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}