import { useRef, useState } from 'react'
import { Share2, Check, Copy, Mail, MoreHorizontal } from 'lucide-react'
import Modal from './Modal'
import './ShareButton.css'

// Nút "Chia sẻ" mở 1 popup nhỏ: link câu hỏi + nút sao chép, và các nút chia sẻ nhanh
// (Facebook, X, Email dùng link chia sẻ công khai của từng nơi; "Khác..." dùng bảng chia sẻ
// của hệ điều hành, chỉ hiện khi trình duyệt hỗ trợ - chủ yếu trên điện thoại).
// title: tiêu đề câu hỏi, dùng làm nội dung kèm theo khi chia sẻ
function ShareButton({ url, title = '' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const inputRef = useRef(null)

  const shareUrl = url || window.location.href
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  const targets = [
    {
      label: 'Facebook',
      short: 'f',
      className: 'is-facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: 'X (Twitter)',
      short: 'X',
      className: 'is-x',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: 'Email',
      icon: Mail,
      className: 'is-email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A${encodedUrl}`,
    },
  ]

  function openModal() {
    setCopied(false)
    setCopyFailed(false)
    setOpen(true)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setCopyFailed(false)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Trình duyệt chặn clipboard API: bôi đen sẵn link để người dùng tự nhấn Ctrl+C
      setCopyFailed(true)
      inputRef.current?.select()
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url: shareUrl })
    } catch {
      // Người dùng đóng share sheet giữa chừng, không phải lỗi thật
    }
  }

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={openModal}>
        <Share2 size={14} /> Chia sẻ
      </button>

      {open && (
        <Modal
          title="Chia sẻ câu hỏi"
          subtitle={title || undefined}
          icon={<Share2 size={20} />}
          size="sm"
          onClose={() => setOpen(false)}
        >
          <label className="share-label" htmlFor="share-link">
            Đường dẫn
          </label>
          <div className="share-link-row">
            <input
              ref={inputRef}
              id="share-link"
              className="input share-link-input"
              value={shareUrl}
              readOnly
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              className={`btn ${copied ? 'btn-success' : 'btn-primary'} share-copy-btn`}
              onClick={handleCopy}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>
          {copyFailed && (
            <p className="share-hint">Trình duyệt chặn sao chép tự động - link đã được bôi đen, nhấn Ctrl+C.</p>
          )}

          <p className="share-label">Chia sẻ qua</p>
          <div className="share-targets">
            {targets.map((t) => (
              <a
                key={t.label}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`share-target ${t.className}`}
              >
                <span className="share-target-icon" aria-hidden="true">
                  {t.icon ? <t.icon size={18} /> : t.short}
                </span>
                {t.label}
              </a>
            ))}
            {typeof navigator !== 'undefined' && navigator.share && (
              <button type="button" className="share-target is-more" onClick={handleNativeShare}>
                <span className="share-target-icon" aria-hidden="true">
                  <MoreHorizontal size={18} />
                </span>
                Khác...
              </button>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}

export default ShareButton
