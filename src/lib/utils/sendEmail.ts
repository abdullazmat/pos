import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create reusable transporter with explicit STARTTLS (port 587)
const createTransporter = (override?: Partial<SMTPTransport.Options>) => {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  // Force 587 STARTTLS unless explicitly overridden
  const port = Number(process.env.EMAIL_PORT) || 587;

  const baseOptions: SMTPTransport.Options = {
    host,
    port,
    secure: false, // STARTTLS
    requireTLS: true, // enforce STARTTLS upgrade
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Connection timeouts to fail fast on unreachable hosts
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    // Reduce certificate-related failures in some cloud egress paths
    tls: { rejectUnauthorized: false },
    // Helpful logs in non-production to diagnose connection issues
    logger: process.env.NODE_ENV !== "production",
  };

  return nodemailer.createTransport({ ...baseOptions, ...(override || {}) });
};

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    let transporter = createTransporter();

    // Verify transporter configuration with clear logging
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      console.error(
        "SMTP verify failed",
        {
          host: (transporter as any).options?.host,
          port: (transporter as any).options?.port,
          secure: (transporter as any).options?.secure,
          requireTLS: (transporter as any).options?.requireTLS,
        },
        verifyError,
      );
      throw verifyError;
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"POS SaaS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName?: string,
) {
  const subject = "Recuperación de Contraseña - POS SaaS";

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperación de Contraseña</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔐 Recuperación de Contraseña</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${userName ? `<p style="margin: 0 0 20px; font-size: 16px; color: #333333;">Hola ${userName},</p>` : ""}
                  
                  <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en POS SaaS.
                  </p>
                  
                  <p style="margin: 0 0 30px; font-size: 16px; color: #333333; line-height: 1.6;">
                    Haz clic en el botón de abajo para crear una nueva contraseña:
                  </p>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 0 0 30px;">
                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Restablecer Contraseña
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 20px; font-size: 14px; color: #666666; line-height: 1.6;">
                    Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                  </p>
                  
                  <p style="margin: 0 0 30px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; font-size: 14px; color: #2563eb; word-break: break-all;">
                    ${resetUrl}
                  </p>
                  
                  <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: bold;">
                      ⚠️ Importante:
                    </p>
                    <p style="margin: 10px 0 0; font-size: 14px; color: #92400e; line-height: 1.6;">
                      Este enlace expirará en <strong>1 hora</strong> por razones de seguridad.
                    </p>
                  </div>
                  
                  <p style="margin: 0 0 10px; font-size: 14px; color: #666666; line-height: 1.6;">
                    Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                  </p>
                  
                  <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                    Tu contraseña no será cambiada hasta que accedas al enlace y crees una nueva.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                    Saludos,<br>
                    <strong>El equipo de POS SaaS</strong>
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #999999;">
                    Este es un correo automático, por favor no respondas a este mensaje.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}
