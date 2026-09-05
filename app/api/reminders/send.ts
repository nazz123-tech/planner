import type { Transporter } from "nodemailer";

interface SendArgs {
    to: string;
    subject: string;
    text: string;
    html: string;
}

export type EmailProvider = "gmail";

export function emailProvider(): EmailProvider | null {
    return process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
        ? "gmail"
        : null;
}

let transport: Transporter | null = null;

async function getTransport(): Promise<Transporter> {
    if (transport) return transport;

    // Imported lazily so nodemailer stays out of the client bundle graph.
    const nodemailer = (await import("nodemailer")).default;
    transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_USER!,
            // App passwords are displayed in groups of four; the spaces are
            // presentation only and must be stripped before authenticating.
            pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s+/g, ""),
        },
    });
    return transport;
}

export async function sendEmail(args: SendArgs) {
    if (!emailProvider()) {
        throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set");
    }

    // Gmail rewrites From to the authenticated account, so REMINDER_FROM only
    // controls the display name.
    const from =
        process.env.REMINDER_FROM ?? `Planly <${process.env.GMAIL_USER}>`;

    await (await getTransport()).sendMail({
        from,
        to: args.to,
        subject: args.subject,
        text: args.text,
        html: args.html,
    });
}
