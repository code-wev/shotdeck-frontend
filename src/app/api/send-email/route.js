// app/api/send-email/route.js
import nodemailer from 'nodemailer';

export async function POST(request) {
  const { name, message, email } = await request.json();

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "rakib.fbinternational@gmail.com",
        pass: "gbjv irau ksag logr",
      },
    });

    await transporter.sendMail({
      from: email,
      to: 'contact.fxreferences@gmail.com',
      subject: "New Message",
      text: `Name: ${name}\nMessage: ${message}`,
      html: `  <div style="background-color: #121212; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; border-radius: 8px; max-width: 500px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
    <h2 style="color: #ffffff; border-bottom: 1px solid #333; padding-bottom: 10px;">📨 New Message</h2>
    <p style="font-size: 16px; line-height: 1.5;">You have received a new message:</p>
    
    <div style="margin: 30px 0;">
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>Name:</strong></p>
      <span style="display: inline-block; background: #1e1e1e; padding: 15px; font-size: 18px; font-weight: bold; color: #ffffff; border-radius: 6px; border: 1px solid #333; width: 100%;">
        ${name}
      </span>
      
      <p style="font-size: 16px; margin: 20px 0 10px;"><strong>Message:</strong></p>
      <span style="display: inline-block; background: #1e1e1e; padding: 15px; font-size: 16px; color: #ffffff; border-radius: 6px; border: 1px solid #333; width: 100%; min-height: 100px; line-height: 1.5;">
        ${message}
      </span>
    </div>
    
    <p style="font-size: 14px; color: #aaa;">This message was sent to: ${email || "unknown"}</p>
    <p style="font-size: 14px; margin-top: 30px;">Thanks,<br><strong>Fx-References Team</strong></p>
  </div>`
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}