const nodemailer = require('nodemailer');

// Gửi email qua Gmail SMTP. GMAIL_USER là địa chỉ Gmail, GMAIL_APP_PASSWORD là
// "Mật khẩu ứng dụng" 16 ký tự tạo trong Cài đặt bảo mật tài khoản Google
// (không phải mật khẩu Gmail thường) - xem GMAIL_SETUP.md
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendResetPasswordEmail(to, resetLink) {
  await transporter.sendMail({
    from: `"AskHub" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Đặt lại mật khẩu AskHub',
    html: `
      <p>Chào bạn,</p>
      <p>Có yêu cầu đặt lại mật khẩu cho tài khoản AskHub gắn với email này.</p>
      <p>Bấm vào link bên dưới để đặt mật khẩu mới (link có hiệu lực trong 1 giờ):</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này - mật khẩu hiện tại vẫn an toàn.</p>
    `,
  });
}

module.exports = { sendResetPasswordEmail };
