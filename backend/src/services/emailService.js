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

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function formatBookingDate(value) {
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}

function formatBookingMoney(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0));
}

export async function sendBookingConfirmationEmail(reservation) {
  const stayDates = reservation.bookingKind === 'day_tour'
    ? formatBookingDate(reservation.checkIn)
    : `${formatBookingDate(reservation.checkIn)} - ${formatBookingDate(reservation.checkOut)}`;
  const bookingKind = reservation.bookingKind === 'day_tour' ? 'Day tour' : 'Overnight stay';
  const extras = [...(reservation.serviceItems || []), ...(reservation.menuItems || [])];
  const extrasText = extras.length
    ? extras.map((item) => `${item.name} x${item.quantity}: ${formatBookingMoney(item.totalAmount)}`).join('\n')
    : 'No additional services or menu items';
  const extrasHtml = extras.length
    ? extras.map((item) => `<tr><td style="padding:8px 0;border-bottom:1px solid #e3e7e0;">${escapeHtml(item.name)} × ${item.quantity}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #e3e7e0;">${formatBookingMoney(item.totalAmount)}</td></tr>`).join('')
    : '<tr><td colspan="2" style="padding:8px 0;color:#65756d;">No additional services or menu items</td></tr>';
  const guestNote = reservation.guestNote
    ? `<p style="margin:18px 0 0;color:#65756d;font:14px/1.6 Arial,sans-serif;"><strong>Note for your host:</strong> ${escapeHtml(reservation.guestNote)}</p>`
    : '';

  try {
    await getTransporter().sendMail({
      from: env.smtp.from,
      to: reservation.guestEmail,
      subject: `Booking request ${reservation.referenceNumber} received | Bersantai`,
      text: `BERSANTAI\n\nHello ${reservation.guestName},\n\nWe have received your booking request. Our stay team will review it and follow up.\n\nReference: ${reservation.referenceNumber}\nStay: ${reservation.villaName}${reservation.villaLocation ? `, ${reservation.villaLocation}` : ''}\nType: ${bookingKind}\nDates: ${stayDates}\nGuests: ${reservation.guests}\nPayment: ${reservation.paymentMethod} (${reservation.paymentStatus})\nEstimated total: ${formatBookingMoney(reservation.totalAmount)}\n\n${extrasText}${reservation.guestNote ? `\n\nNote for your host: ${reservation.guestNote}` : ''}\n\nBersantai`,
      html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your Bersantai booking request</title></head>
<body style="margin:0;background:#f5f2ea;color:#173d3a;font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Your booking request ${escapeHtml(reservation.referenceNumber)} has been received.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ea;padding:32px 16px;"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fffdf8;border:1px solid #d8ddd4;">
      <tr><td style="background:#173d3a;padding:28px 36px;text-align:center;"><div style="color:#edc873;font:700 11px Arial,sans-serif;letter-spacing:5px;">BERSANTAI</div><div style="margin-top:10px;color:#fffdf8;font-size:13px;">A considered stay in Bali</div></td></tr>
      <tr><td style="padding:36px;">
        <div style="color:#b0833e;font:700 10px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;">Booking request received</div>
        <h1 style="margin:12px 0;color:#173d3a;font-size:32px;font-weight:normal;">Your stay is on its way.</h1>
        <p style="margin:0 0 24px;color:#65756d;font:14px/1.7 Arial,sans-serif;">Hello ${escapeHtml(reservation.guestName)}, we have received your request. Our stay team will review it and follow up with you.</p>
        <div style="padding:15px 18px;background:#f3f6f0;border:1px solid #d8ddd4;font:13px Arial,sans-serif;"><span style="color:#65756d;">Booking reference</span><strong style="float:right;color:#173d3a;">${escapeHtml(reservation.referenceNumber)}</strong></div>
        <h2 style="margin:26px 0 12px;font-size:21px;font-weight:normal;">Stay details</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font:13px/1.6 Arial,sans-serif;color:#52605a;">
          <tr><td style="padding:7px 0;">Villa</td><td align="right" style="padding:7px 0;color:#173d3a;">${escapeHtml(reservation.villaName)}${reservation.villaLocation ? ` · ${escapeHtml(reservation.villaLocation)}` : ''}</td></tr>
          <tr><td style="padding:7px 0;">Stay type</td><td align="right" style="padding:7px 0;color:#173d3a;">${bookingKind}</td></tr>
          <tr><td style="padding:7px 0;">Dates</td><td align="right" style="padding:7px 0;color:#173d3a;">${stayDates}</td></tr>
          <tr><td style="padding:7px 0;">Guests</td><td align="right" style="padding:7px 0;color:#173d3a;">${reservation.guests}</td></tr>
          <tr><td style="padding:7px 0;">Payment</td><td align="right" style="padding:7px 0;color:#173d3a;">${escapeHtml(reservation.paymentMethod)} · ${escapeHtml(reservation.paymentStatus)}</td></tr>
        </table>
        <h2 style="margin:26px 0 12px;font-size:21px;font-weight:normal;">Services and dining</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font:13px/1.5 Arial,sans-serif;color:#52605a;">${extrasHtml}</table>
        ${guestNote}
        <div style="display:flex;justify-content:space-between;border-top:1px solid #d8ddd4;margin-top:24px;padding-top:18px;font:14px Arial,sans-serif;"><span style="color:#65756d;">Estimated total</span><strong style="color:#173d3a;font-size:18px;">${formatBookingMoney(reservation.totalAmount)}</strong></div>
        <p style="margin:22px 0 0;color:#89958d;font:12px/1.6 Arial,sans-serif;">Reservation status: pending review. This message confirms receipt of your request, not final confirmation of availability.</p>
      </td></tr>
      <tr><td style="border-top:1px solid #e3e7e0;padding:20px 36px;text-align:center;color:#8b652c;font:11px Arial,sans-serif;">A considered stay, from the first detail.</td></tr>
    </table>
  </td></tr></table>
</body></html>`
    });
  } catch (_error) {
    throw new ApiError(502, 'Booking confirmation email could not be sent.');
  }
}
