import nodemailer from 'nodemailer';
import { env } from '../config/env.ts';

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type Recipient = {
  email: string;
  firstName: string;
};

type ApplicationNotice = Recipient & {
  animalName: string;
  status?: 'approved' | 'rejected' | 'withdrawn';
  decisionNote?: string;
};

type AppointmentNotice = Recipient & {
  animalName: string;
  startsAt: Date | string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
};

type PasswordResetNotice = Recipient & {
  token: string;
};

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

const getTransporter = () => {
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_APP_PASSWORD },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  return transporter;
};

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const page = (title: string, firstName: string, body: string, actionPath?: string, actionLabel?: string) => {
  const action = actionPath && actionLabel
    ? `<p style="margin:24px 0"><a href="${escapeHtml(`${env.CLIENT_ORIGIN}${actionPath}`)}" style="background:#12664f;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;display:inline-block">${escapeHtml(actionLabel)}</a></p>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#f4f7f6;font-family:Arial,sans-serif;color:#17211d"><div style="max-width:600px;margin:0 auto;padding:32px 18px"><div style="background:#fff;border:1px solid #dce5e1;border-radius:8px;padding:28px"><h1 style="font-size:24px;margin:0 0 18px;color:#12664f">${escapeHtml(title)}</h1><p>Hello ${escapeHtml(firstName)},</p>${body}${action}<p style="margin-top:28px">PawConnect Support</p></div><p style="font-size:12px;color:#66736d;text-align:center">Questions? Contact ${escapeHtml(env.SUPPORT_EMAIL)}</p></div></body></html>`;
};

const dateTime = (value: Date | string) => new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'America/Chicago',
}).format(new Date(value));

const send = async (message: EmailMessage) => {
  if (env.EMAIL_MODE === 'disabled') return;
  if (env.EMAIL_MODE === 'log') {
    console.info(`[email] to=${message.to} subject=${message.subject}`);
    return;
  }
  await getTransporter().sendMail({
    from: env.EMAIL_FROM,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
};

const deliver = async (message: EmailMessage): Promise<boolean> => {
  try {
    await send(message);
    return true;
  } catch (error) {
    console.error(`[email] delivery failed for ${message.to}:`, error instanceof Error ? error.message : error);
    return false;
  }
};

export const sendWelcomeEmail = ({ email, firstName }: Recipient) => deliver({
  to: email,
  subject: 'Welcome to PawConnect',
  text: `Hello ${firstName}, your PawConnect account is ready. You can now browse animals and submit adoption applications.`,
  html: page('Welcome to PawConnect', firstName, '<p>Your account is ready. You can now browse animals and submit adoption applications.</p>', '/animals', 'Browse animals'),
});

export const sendPasswordResetEmail = ({ email, firstName, token }: PasswordResetNotice) => {
  const resetPath = `/reset-password?token=${encodeURIComponent(token)}`;
  return deliver({
    to: email,
    subject: 'Reset your PawConnect password',
    text: `Hello ${firstName}, use this link within 30 minutes to reset your PawConnect password: ${env.CLIENT_ORIGIN}${resetPath}. If you did not request this, you can ignore this email.`,
    html: page('Reset your password', firstName, '<p>We received a request to reset your PawConnect password. This link expires in 30 minutes and can be used only once.</p><p>If you did not request this, you can safely ignore this email.</p>', resetPath, 'Reset password'),
  });
};

export const sendApplicationSubmittedEmails = async ({ email, firstName, animalName }: ApplicationNotice) => {
  await Promise.all([
    deliver({
      to: email,
      subject: `Application received for ${animalName}`,
      text: `Hello ${firstName}, we received your adoption application for ${animalName}. You can track its status in My Applications.`,
      html: page('Application received', firstName, `<p>We received your adoption application for <strong>${escapeHtml(animalName)}</strong>.</p><p>You can track its status in My Applications.</p>`, '/my/applications', 'View application'),
    }),
    deliver({
      to: env.SUPPORT_EMAIL,
      subject: `New adoption application: ${animalName}`,
      text: `${firstName} (${email}) submitted an adoption application for ${animalName}.`,
      html: page('New adoption application', 'PawConnect team', `<p><strong>${escapeHtml(firstName)}</strong> (${escapeHtml(email)}) submitted an application for <strong>${escapeHtml(animalName)}</strong>.</p>`, '/admin/applications', 'Review applications'),
    }),
  ]);
};

export const sendApplicationStatusEmail = ({ email, firstName, animalName, status, decisionNote = '' }: ApplicationNotice) => {
  const label = status === 'approved' ? 'approved' : status === 'rejected' ? 'not approved' : 'withdrawn';
  const note = decisionNote ? `<p><strong>Review note:</strong> ${escapeHtml(decisionNote)}</p>` : '';
  return deliver({
    to: email,
    subject: `Application ${label}: ${animalName}`,
    text: `Hello ${firstName}, your adoption application for ${animalName} was ${label}.${decisionNote ? ` Note: ${decisionNote}` : ''}`,
    html: page('Application update', firstName, `<p>Your adoption application for <strong>${escapeHtml(animalName)}</strong> was <strong>${label}</strong>.</p>${note}`, '/my/applications', 'View application'),
  });
};

export const sendAppointmentStatusEmail = ({ email, firstName, animalName, startsAt, status }: AppointmentNotice) => {
  const when = dateTime(startsAt);
  return deliver({
    to: email,
    subject: `Appointment ${status}: ${animalName}`,
    text: `Hello ${firstName}, your appointment for ${animalName} on ${when} is ${status}.`,
    html: page('Appointment update', firstName, `<p>Your appointment for <strong>${escapeHtml(animalName)}</strong> on <strong>${escapeHtml(when)}</strong> is <strong>${status}</strong>.</p>`, '/my/appointments', 'View appointments'),
  });
};

export const sendAdoptionCompletedEmail = ({ email, firstName, animalName }: ApplicationNotice) => deliver({
  to: email,
  subject: `Adoption completed: ${animalName}`,
  text: `Hello ${firstName}, the adoption of ${animalName} is complete. Thank you for choosing adoption.`,
  html: page('Adoption completed', firstName, `<p>The adoption of <strong>${escapeHtml(animalName)}</strong> is complete. Thank you for choosing adoption.</p>`, '/my/adoption-history', 'View adoption history'),
});

export const verifyEmailTransport = async () => {
  if (env.EMAIL_MODE !== 'smtp') throw new Error('EMAIL_MODE must be smtp to verify Gmail delivery.');
  await getTransporter().verify();
};

export const sendEmailTest = () => send({
  to: env.SUPPORT_EMAIL,
  subject: 'PawConnect email configuration test',
  text: 'PawConnect successfully connected to Gmail SMTP and delivered this test message.',
  html: page('Email configuration verified', 'PawConnect team', '<p>PawConnect successfully connected to Gmail SMTP and delivered this test message.</p>'),
});

export const emailTemplateUtils = { escapeHtml, dateTime };
