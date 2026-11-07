import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email, otp, purpose = 'registration') {
  const subject = purpose === 'login'
    ? 'Your DEV@Deakin Login Verification Code'
    : 'Verify Your DEV@Deakin Account';

  const heading = purpose === 'login'
    ? 'Login Verification'
    : 'Email Verification';

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; background: #f8fafc; border-radius: 12px;">

          <h2 style="color: #2563eb;">DEV@Deakin</h2>

          <h3>${heading}</h3>

          <p>Your verification code is:</p>

          <div style="padding: 20px; text-align: center; background: #e2e8f0; border-radius: 10px;">

            <h1 style="letter-spacing: 10px; color: #1e293b;">
              ${otp}
            </h1>

          </div>

          <p>This code expires in <strong>5 minutes</strong>.</p>

          <p>If you did not request this code, please ignore this email.</p>

          <hr />

          <p style="color: #64748b; font-size: 12px;">
            DEV@Deakin Security Team
          </p>

        </div>
      `
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error('Unable to send verification email.');
    }

    return data;

  } catch (error) {
    console.error('Email delivery failed:', error.message);
    throw new Error('Email delivery failed.');
  }
}

export async function sendWelcomeEmail(email, fullName) {
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: 'Welcome to DEV@Deakin!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 30px; background: #f8fafc;">

          <h2 style="color: #2563eb;">Welcome to DEV@Deakin!</h2>

          <p>Hello ${fullName},</p>

          <p>Your account has been successfully created and your email has been verified.</p>

          <p>We're excited to have you as part of our developer community.</p>

          <br />

          <strong>DEV@Deakin Team</strong>

        </div>
      `
    });

    if (error) {
      console.error('Welcome email error:', error);
    }

  } catch (error) {
    console.error('Welcome email failed:', error.message);
  }
}