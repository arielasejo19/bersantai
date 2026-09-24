import nodemailer from 'nodemailer';
import { env, hasSmtpConfig } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

let transporter;

function getTransporter() {
  if (!hasSmtpConfig()) throw new ApiError(503, 'Email delivery is not configured');
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.password }
    });
  }
  return transporter;
}

export async function sendBookingVerificationEmail(email, code) {
  try {
    await getTransporter().sendMail({
      from: env.smtp.from,
      to: email,
      subject: `${code} is your Bersantai verification code`,
      text: `BERSANTAI\n\nConfirm your email\n\nUse ${code} to continue your booking request. This code expires in 10 minutes. If you did not request this code, you can safely ignore this email.\n\nA considered stay, from the first detail.`,
      html: `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your Bersantai verification code</title></head>
  <body style="margin:0;background:#f5f2ea;color:#173d3a;font-family:Georgia,'Times New Roman',serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Your Bersantai verification code is ready.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ea;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border:1px solid #d8ddd4;">
          <tr><td style="background:#173d3a;padding:30px 38px;text-align:center;">
            <div style="color:#edc873;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:5px;">BERSANTAI</div>
            <div style="margin-top:12px;color:#fffdf8;font-size:13px;letter-spacing:1px;">A considered stay in Bali</div>
          </td></tr>
          <tr><td style="padding:42px 38px 38px;text-align:center;">
            <div style="color:#b0833e;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;">Email verification</div>
            <h1 style="margin:12px 0 14px;color:#173d3a;font-size:32px;font-weight:normal;line-height:1.15;">Confirm your email</h1>
            <p style="margin:0 auto;max-width:390px;color:#65756d;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;">Use the code below to continue planning your stay. It is valid for the next 10 minutes.</p>
            <div style="margin:30px auto;padding:20px 16px;border:1px solid #d8ddd4;background:#f8faf5;">
              <div style="color:#89958d;font-family:Arial,sans-serif;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">Your verification code</div>
              <div style="margin-top:10px;color:#176059;font-family:Arial,sans-serif;font-size:32px;font-weight:bold;letter-spacing:8px;">${code}</div>
            </div>
            <p style="margin:0 auto;max-width:390px;color:#89958d;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;">If you did not request this code, you can safely ignore this message.</p>
          </td></tr>
          <tr><td style="border-top:1px solid #e3e7e0;padding:22px 38px;text-align:center;">
            <div style="color:#8b652c;font-family:Arial,sans-serif;font-size:11px;letter-spacing:1px;">A considered stay, from the first detail.</div>
            <div style="margin-top:8px;color:#a1aaa4;font-family:Arial,sans-serif;font-size:10px;">This is an automated message from Bersantai.</div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
    });
  } catch (_error) {
    throw new ApiError(502, 'Verification email could not be sent. Check the Gmail app password and SMTP settings.');
  }
}