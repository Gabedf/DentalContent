const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function sendPasswordReset(email, name, resetUrl) {
  if (!resend) {
    // Em desenvolvimento sem Resend configurado, loga o link no console
    console.log('=== EMAIL DE RESET (sem Resend configurado) ===');
    console.log(`Para: ${email}`);
    console.log(`Link: ${resetUrl}`);
    console.log('===============================================');
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'DentalContent Pro <noreply@dentalcontentpro.com.br>',
    to: email,
    subject: 'Redefinição de senha — DentalContent Pro',
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#FAFAF8;font-family:'Helvetica Neue',Arial,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#FFFFFF;border:1px solid #E8E6E0;border-radius:12px;overflow:hidden;">
          
          <div style="background:#1A1A18;padding:28px 36px;">
            <p style="margin:0;color:#FFFFFF;font-size:18px;font-weight:700;letter-spacing:-0.3px;">DentalContent Pro</p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Sistema Editorial</p>
          </div>

          <div style="padding:36px;">
            <p style="margin:0 0 8px;color:#1A1A18;font-size:22px;font-weight:700;">Redefinição de senha</p>
            <p style="margin:0 0 24px;color:#555550;font-size:14px;line-height:1.6;">
              Olá, ${name}. Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
            </p>

            <a href="${resetUrl}" style="display:inline-block;background:#1A1A18;color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;margin-bottom:24px;">
              Redefinir minha senha
            </a>

            <p style="margin:0 0 8px;color:#999990;font-size:12px;line-height:1.6;">
              Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição, ignore este e-mail — sua senha permanece a mesma.
            </p>

            <div style="border-top:1px solid #E8E6E0;margin-top:24px;padding-top:20px;">
              <p style="margin:0;color:#C8C6C0;font-size:11px;">
                Ou acesse diretamente: <a href="${resetUrl}" style="color:#2D6A4F;">${resetUrl}</a>
              </p>
            </div>
          </div>

        </div>
      </body>
      </html>
    `,
  });
}

module.exports = { sendPasswordReset };
