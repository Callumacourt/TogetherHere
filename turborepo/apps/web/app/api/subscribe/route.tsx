import { Resend } from "resend";
import cleanEmail from "../../../utils/cleanEmail";
import WelcomeEmail from "../../../emails/WelcomeEmail";

const resend = new Resend(process.env.RESEND_KEY);
const segmentId = process.env.RESEND_SEGMENT_ID ?? "";

export async function POST(req: Request) {
    const body = await req.json();
    if (!body.email) return Response.json({ success: false, error: "No email specified" });
    
    const cleanedEmail = cleanEmail(body.email);
    if (!cleanedEmail) {
        return Response.json({ success: false, error: "Invalid email input" }, { status: 400 });
    }

    if (segmentId) {
        try {
            await resend.contacts.create({ email: cleanedEmail });
        } catch (createErr: unknown) {
            const msg = createErr instanceof Error ? createErr.message : "Unknown error";
            console.error(msg);
        }
        // add contact to the segment so can batch email
        try {
            await resend.contacts.segments.add({
                segmentId,
                email: cleanedEmail,
            });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Unknown error";
            console.error(msg);
        }
    }

    try {
        console.log("Sending welcome email to:", cleanedEmail);

        // add a modest timeout so a network hang doesn't keep the request open forever
        const sendPromise = resend.emails.send({
            from: "TogetherHere <onboarding@resend.dev>",
            to: cleanedEmail,
            subject: "Welcome",
            react: <WelcomeEmail />,
        });

        const timeoutMs = 15_000;
        const { data, error } = await Promise.race([
            sendPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Email send timeout")), timeoutMs)),
        ]) as { data?: unknown; error?: any };

        if (error) {
            console.error("Resend send returned error:", error);
            return Response.json({ success: false, error: String(error?.message ?? error) }, { status: 502 });
        }

        if (data) {
            console.log("Welcome email sent — response:", data);
            return Response.json({ success: true }, { status: 200 });
        }

        return Response.json({ success: false, error: "No response from email service" }, { status: 502 });
    } catch (unexpectedError: unknown) {
        console.error("Unexpected error while sending welcome email:", unexpectedError);
        return Response.json({
            success: false,
            error: unexpectedError instanceof Error ? unexpectedError.message : "An unexpected error occured, please try again.",
        }, { status: 500 });
    }
}