require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'appabbachurch@gmail.com',
    pass: 'qmzp qbmv fxbd hteu',
  },
});

async function enviarEmail(destinatario, assunto, corpo) {
  try {
    const mailOptions = {
      from: 'appabbachurch@gmail.com',
      to: destinatario,
      subject: assunto,
      html: `<div>${corpo}</div>
      <div style="margin-top:50px"><img height="150px" src="https://yt3.googleusercontent.com/jtadxLQN52RMiojqb1k_iYAN39Whf0N9x--99LUd_B46dLVmwVSnvPZ81GsCNNQcofrSo11rGA=s900-c-k-c0x00ffffff-no-rj"></div>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado:', info.response);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

module.exports = { enviarEmail }