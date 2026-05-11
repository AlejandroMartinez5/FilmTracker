const nodemailer = require("nodemailer");

const hasMailConfig = () => {
  return Boolean(
    process.env.MAIL_HOST &&
      process.env.MAIL_PORT &&
      process.env.MAIL_USER &&
      process.env.MAIL_PASS
  );
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });
};

const sendMail = async ({ to, subject, html }) => {
  if (!hasMailConfig()) {
    console.warn(`Correo no enviado. Configura MAIL_HOST, MAIL_PORT, MAIL_USER y MAIL_PASS. Destino: ${to}`);
    return { sent: false };
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject,
    html
  });

  return { sent: true };
};

const sendVerificationEmail = async ({ email, code }) => {
  return sendMail({
    to: email,
    subject: "Verifica tu correo en ReelTrack",
    html: `
      <h1>Verifica tu correo</h1>
      <p>Introduce este codigo en ReelTrack para poder publicar resenas y comentarios.</p>
      <h2 style="letter-spacing: 6px;">${code}</h2>
      <p>Este codigo expira en 15 minutos.</p>
    `
  });
};

const sendPasswordResetEmail = async ({ email, code }) => {
  return sendMail({
    to: email,
    subject: "Recupera tu contrasena de ReelTrack",
    html: `
      <h1>Recuperar contrasena</h1>
      <p>Introduce este codigo en ReelTrack para crear una nueva contrasena.</p>
      <h2 style="letter-spacing: 6px;">${code}</h2>
      <p>Este codigo expira en 15 minutos.</p>
    `
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
