const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'appabbachurch@gmail.com',
    pass: '@@Flash2010@@@',
  },
});

async function enviarEmail(destinatario, assunto, corpo) {
  try {
    const mailOptions = {
      from: 'appabbachurch@gmail.com',
      to: destinatario,
      subject: assunto,
      text: corpo,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado:', info.response);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

module.exports = { enviarEmail }