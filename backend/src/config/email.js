const nodemailer = require('nodemailer');
const logger = require('./logger');

const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
const fromName = process.env.GMAIL_FROM_NAME || process.env.SMTP_FROM_NAME || 'Ayuda Tica';
const fromEmail = process.env.GMAIL_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || gmailUser;

// Configuración del transportador de email
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para 587 (STARTTLS)
  auth: {
    user: gmailUser,
    pass: gmailAppPassword
  }
});

if (!gmailUser || !gmailAppPassword) {
  logger.warn('Credenciales de Gmail SMTP incompletas. Configura GMAIL_USER y GMAIL_APP_PASSWORD.');
}

// Verificar configuración de email al iniciar
transporter.verify(function (error, success) {
  if (error) {
    logger.error('Error en configuración de email:', error);
  } else {
    logger.info('Servidor de email listo para enviar mensajes');
  }
});

/**
 * Envía un email
 * @param {Object} options - Opciones del email
 * @param {String} options.to - Destinatario
 * @param {String} options.subject - Asunto
 * @param {String} options.text - Contenido en texto plano
 * @param {String} options.html - Contenido en HTML
 * @returns {Promise}
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email enviado: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error al enviar email:', error);
    throw error;
  }
};

/**
 * Template de email de bienvenida
 */
const emailTemplates = {
  bienvenida: (nombre) => ({
    subject: '¡Bienvenido a Ayuda Tica!',
    html: `
      <h1>¡Bienvenido a Ayuda Tica, ${nombre}!</h1>
      <p>Gracias por unirte a nuestra plataforma solidaria.</p>
      <p>Ahora puedes:</p>
      <ul>
        <li>Crear casos de ayuda</li>
        <li>Reportar violaciones a la Ley 7600</li>
        <li>Donar a causas que te importan</li>
      </ul>
      <p>¡Juntos hacemos la diferencia! 🇨🇷</p>
      <br>
      <p>Equipo de Ayuda Tica</p>
    `,
    text: `¡Bienvenido a Ayuda Tica, ${nombre}! Gracias por unirte a nuestra plataforma solidaria.`
  }),

  verificacionEmail: (nombre, token) => ({
    subject: 'Verifica tu email - Ayuda Tica',
    html: `
      <h1>Hola ${nombre},</h1>
      <p>Por favor verifica tu dirección de email haciendo clic en el siguiente enlace:</p>
      <a href="${process.env.CLOUDFLARE_TUNNEL_URL}/verificar/${token}">Verificar Email</a>
      <p>Este enlace expira en 24 horas.</p>
      <br>
      <p>Si no creaste una cuenta en Ayuda Tica, puedes ignorar este mensaje.</p>
    `,
    text: `Hola ${nombre}, verifica tu email en: ${process.env.CLOUDFLARE_TUNNEL_URL}/verificar/${token}`
  }),

  casoAprobado: (nombre, titulo) => ({
    subject: 'Tu caso de ayuda fue aprobado',
    html: `
      <h1>¡Buenas noticias, ${nombre}!</h1>
      <p>Tu caso de ayuda "<strong>${titulo}</strong>" ha sido aprobado y ya está visible en la plataforma.</p>
      <p>Puedes compartir el enlace con tus contactos para recibir más apoyo.</p>
      <br>
      <p>¡Mucho éxito!</p>
      <p>Equipo de Ayuda Tica</p>
    `,
    text: `¡Buenas noticias ${nombre}! Tu caso "${titulo}" ha sido aprobado.`
  }),

  nuevaDonacion: (nombre, monto, nombreDonante) => ({
    subject: '¡Has recibido una nueva donación!',
    html: `
      <h1>¡Felicidades ${nombre}!</h1>
      <p>Has recibido una donación de <strong>₡${monto}</strong> de ${nombreDonante || 'un donante anónimo'}.</p>
      <p>Revisa tu cuenta de Sinpe Móvil para confirmar la transferencia.</p>
      <br>
      <p>¡Gracias por usar Ayuda Tica!</p>
    `,
    text: `¡Felicidades ${nombre}! Has recibido una donación de ₡${monto}.`
  }),

  reporteAsignado: (nombre, tituloReporte) => ({
    subject: 'Se te ha asignado un nuevo reporte',
    html: `
      <h1>Hola ${nombre},</h1>
      <p>Se te ha asignado el siguiente reporte de Ley 7600:</p>
      <p><strong>${tituloReporte}</strong></p>
      <p>Por favor revisa el reporte en tu panel de autoridad.</p>
      <br>
      <p>Equipo de Ayuda Tica</p>
    `,
    text: `Hola ${nombre}, se te ha asignado el reporte: ${tituloReporte}`
  }),

  resetPassword: (nombre, token) => ({
    subject: 'Restablecer contraseña - Ayuda Tica',
    html: `
      <h1>Hola ${nombre},</h1>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para continuar:</p>
      <a href="${process.env.CLOUDFLARE_TUNNEL_URL}/reset-password/${token}">Restablecer Contraseña</a>
      <p>Este enlace expira en 1 hora.</p>
      <br>
      <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    `,
    text: `Hola ${nombre}, restablece tu contraseña en: ${process.env.CLOUDFLARE_TUNNEL_URL}/reset-password/${token}`
  })
};

module.exports = {
  transporter,
  sendEmail,
  emailTemplates
};
