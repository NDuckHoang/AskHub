import { useEffect, useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import * as questionService from '../services/questionService'

// Nút lưu/bỏ lưu câu hỏi để xem lại sau, chỉ hiện khi đã đăng nhập
function SaveButton({ questionId, saved: initialSaved }) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(initialSaved)
  const [busy, setBusy] = useState(false)

  // Đồng bộ lại khi chuyển sang xem câu hỏi khác (component không bị unmount giữa các route /questions/:id)
  useEffect(() => {
    setSaved(initialSaved)
  }, [questionId, initialSaved])

  if (!user) return null

  async function handleClick() {
    setBusy(true)
    try {
      const data = await questionService.toggleSaveQuestion(questionId)
      setSaved(data.saved)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={handleClick} disabled={busy}>
      {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />} {saved ? 'Đã lưu' : 'Lưu'}
    </button>
  )
}

export default SaveButton
