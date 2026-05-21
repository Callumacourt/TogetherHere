import { Resend } from "resend";
import cleanEmail from "../../../utils/cleanEmail";

const resend = new Resend(process.env.RESEND_KEY);
const segmentId = process.env.RESEND_SEGMENT_ID ?? "";

export async function POST(req: Request) {
    const body = await req.json();
    if (!body.email) return Response.json({ success: false, error: "No email specified" });
    
    const cleanedEmail = cleanEmail(body.email);
    if (!cleanedEmail) return
    if (typeof cleanEmail === null) return Response.json({ success: false, error: "Invalid email input" });

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
        const { data, error } = await resend.emails.send({
            from: "TogetherHere <onboarding@resend.dev>",
            to: body.email,
            subject: "Welcome to the community",
            html: "<p>Just testing</p>",
        });

        if (error) return Response.json({ success: false, error: error.message });
        if (data) return Response.json({ success: true });
        Response.json({ success: false, error: "No response from email service" })
    } catch (unexpectedError: unknown) {
        return Response.json({
            success: false,
            error: unexpectedError instanceof Error ? unexpectedError.message : "An unexpected error occured, please try again."
        }, { status: 500 });
    }
}