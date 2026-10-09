import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

// Chia sẻ link câu hỏi: dùng share sheet gốc của trình duyệt (chủ yếu trên mobile)
// nếu có, không thì tự sao chép link vào clipboard
function ShareButton({ url }) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    const shareUrl = url || window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl })
      } catch {
        // Người dùng đóng share sheet giữa chừng, không phải lỗi thật
      }
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Trình duyệt chặn clipboard API, bỏ qua lặng lẽ
    }
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={handleClick}>
      {copied ? <Check size={14} /> : <Share2 size={14} />} {copied ? 'Đã sao chép' : 'Chia sẻ'}
    </button>
  )
}

export default ShareButton
