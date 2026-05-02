import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = process.env.EMAIL_FROM || 'liveaula <noreply@liveaula.com>';
const WEB_URL = process.env.WEB_URL || 'https://liveaula.com';

export const emailService = {
  async sendInvitation({
    to,
    professorName,
    studentName,
    subjectName,
    inviteUrl,
    expiresAt,
  }: {
    to: string;
    professorName: string;
    studentName: string;
    subjectName: string;
    inviteUrl: string;
    expiresAt: Date;
  }) {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[email] RESEND_API_KEY not set — skipping email to ${to}. URL: ${inviteUrl}`);
      return;
    }

    const expiryDate = expiresAt.toLocaleDateString('pt-BR');

    await getResend().emails.send({
      from: FROM,
      to,
      subject: `${professorName} convidou você para acompanhar ${studentName} no liveaula`,
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:560px">
        <!-- Header -->
        <tr>
          <td style="background:#1A6B74;padding:24px 32px">
            <p style="margin:0;color:#fff;font-size:22px;font-weight:700">liveaula</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <h1 style="margin:0 0 16px;font-size:20px;color:#111827">Você foi convidado!</h1>
            <p style="margin:0 0 16px;color:#374151;line-height:1.6">
              <strong>${professorName}</strong> convidou você para acompanhar as aulas de
              <strong>${studentName}</strong> em <strong>${subjectName}</strong>.
            </p>
            <p style="margin:0 0 24px;color:#374151;line-height:1.6">
              Com o liveaula você recebe notificações após cada aula — o que foi estudado,
              como o aluno se saiu e observações do professor.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1A6B74;border-radius:8px">
                  <a href="${inviteUrl}"
                    style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:600;text-decoration:none">
                    Aceitar convite →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;color:#9ca3af;font-size:13px">
              Este link expira em ${expiryDate}. Se não esperava este email, pode ignorá-lo.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#9ca3af;font-size:12px">
              liveaula · <a href="${WEB_URL}" style="color:#1A6B74;text-decoration:none">${WEB_URL}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  },

  async sendEmailVerification({
    to,
    name,
    verifyUrl,
  }: {
    to: string;
    name: string;
    verifyUrl: string;
  }) {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[email] RESEND_API_KEY not set — skipping verification email to ${to}. URL: ${verifyUrl}`);
      return;
    }

    await getResend().emails.send({
      from: FROM,
      to,
      subject: 'Confirme seu email — liveaula',
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:560px">
        <tr>
          <td style="background:#1A6B74;padding:24px 32px">
            <p style="margin:0;color:#fff;font-size:22px;font-weight:700">liveaula</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h1 style="margin:0 0 16px;font-size:20px;color:#111827">Confirme seu email</h1>
            <p style="margin:0 0 16px;color:#374151;line-height:1.6">Olá, <strong>${name}</strong>. Seja bem-vindo(a) ao liveaula!</p>
            <p style="margin:0 0 24px;color:#374151;line-height:1.6">
              Clique no botão abaixo para confirmar seu email e ativar sua conta. O link expira em 24 horas.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1A6B74;border-radius:8px">
                  <a href="${verifyUrl}"
                    style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:600;text-decoration:none">
                    Confirmar email →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;color:#9ca3af;font-size:13px">
              Se não criou uma conta no liveaula, ignore este email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#9ca3af;font-size:12px">liveaula · <a href="${WEB_URL}" style="color:#1A6B74;text-decoration:none">${WEB_URL}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  },

  async sendPasswordReset({
    to,
    name,
    resetUrl,
  }: {
    to: string;
    name: string;
    resetUrl: string;
  }) {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[email] RESEND_API_KEY not set — skipping password reset email to ${to}. URL: ${resetUrl}`);
      return;
    }

    await getResend().emails.send({
      from: FROM,
      to,
      subject: 'Redefinir senha — liveaula',
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:560px">
        <tr>
          <td style="background:#1A6B74;padding:24px 32px">
            <p style="margin:0;color:#fff;font-size:22px;font-weight:700">liveaula</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h1 style="margin:0 0 16px;font-size:20px;color:#111827">Redefinir sua senha</h1>
            <p style="margin:0 0 16px;color:#374151;line-height:1.6">Olá, <strong>${name}</strong>.</p>
            <p style="margin:0 0 24px;color:#374151;line-height:1.6">
              Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo.
              O link expira em 1 hora.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1A6B74;border-radius:8px">
                  <a href="${resetUrl}"
                    style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:600;text-decoration:none">
                    Redefinir senha →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;color:#9ca3af;font-size:13px">
              Se não solicitou a redefinição, ignore este email — sua senha continua a mesma.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#9ca3af;font-size:12px">liveaula · <a href="${WEB_URL}" style="color:#1A6B74;text-decoration:none">${WEB_URL}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  },
};
