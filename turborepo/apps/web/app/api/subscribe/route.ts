import { Resend } from "resend";
const resendKey = process.env.RESEND_KEY;
const resend = new Resend(resendKey);


export async function POST (req: Request) {
    const body = await req.json();
    if (!body.email) return Response.json({success: false, error: "No email specified"});

    try {
        const {data, error} = await resend.emails.send({
            from: "TogetherHere <onboarding@resend.dev>",
            to: body.email,
            subject: "Welcome to the community",
            html: "<p>Just testing</p>",
        });
        
        if (error) return Response.json({ success: false, error: error.message})

        if (data) return Response.json({ success: true })

        } catch (unexpectedError: any) {
            return Response.json({
                success: false, 
                error: unexpectedError.message || "An unexpected error occured, please try again."
            },{status: 500});
    };
};