// Nơi lưu JWT phía trình duyệt, theo lựa chọn "Ghi nhớ đăng nhập":
//  - Có ghi nhớ   -> localStorage: còn nguyên sau khi tắt trình duyệt (token backend cấp sống 30 ngày)
//  - Không ghi nhớ -> sessionStorage: tự mất khi đóng trình duyệt/tab (token sống 1 ngày)
// Mọi nơi cần token (AuthContext, api.js) đều đọc/ghi qua 3 hàm này.
const TOKEN_KEY = 'token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export function saveToken(token, remember) {
  clearToken() // xóa token cũ ở cả 2 nơi để không còn sót bản ở chỗ không dùng nữa
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}
