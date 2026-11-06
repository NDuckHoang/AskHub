// Danh sách câu hỏi bảo mật dùng cho chức năng "Quên mật khẩu".
// Người dùng chọn 1 câu khi đăng ký (hoặc trong trang Chỉnh sửa hồ sơ), câu trả lời được
// chuẩn hóa rồi hash bằng bcrypt giống mật khẩu - không lưu câu trả lời dạng plaintext.
const SECURITY_QUESTIONS = [
  'Tên trường tiểu học đầu tiên của bạn là gì?',
  'Tên thú cưng đầu tiên của bạn là gì?',
  'Bạn sinh ra ở thành phố/tỉnh nào?',
  'Tên người bạn thân nhất thời thơ ấu của bạn là gì?',
  'Món ăn bạn thích nhất là gì?',
  'Ngôn ngữ lập trình đầu tiên bạn học là gì?',
];

const ANSWER_MIN_LENGTH = 2;

// Chuẩn hóa câu trả lời để không phân biệt hoa/thường và khoảng trắng thừa:
// "  Trường  Lê Lợi " và "trường lê lợi" được coi là giống nhau
function normalizeAnswer(answer) {
  return String(answer || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// Trả về chuỗi lỗi nếu không hợp lệ, null nếu hợp lệ
function validateSecurityQuestion(question, answer) {
  if (!SECURITY_QUESTIONS.includes(question)) {
    return 'Vui lòng chọn một câu hỏi bảo mật trong danh sách';
  }
  if (normalizeAnswer(answer).length < ANSWER_MIN_LENGTH) {
    return `Câu trả lời bảo mật phải có ít nhất ${ANSWER_MIN_LENGTH} ký tự`;
  }
  return null;
}

module.exports = { SECURITY_QUESTIONS, normalizeAnswer, validateSecurityQuestion };
