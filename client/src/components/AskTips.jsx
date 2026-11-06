import { Lightbulb } from 'lucide-react'
import './AskTips.css'

const TIPS = [
  { title: 'Tìm trước.', text: 'Kiểm tra xem câu hỏi đã tồn tại chưa.' },
  { title: 'Tiêu đề cụ thể.', text: 'Nêu rõ công nghệ và vấn đề.' },
  { title: 'Kèm code.', text: 'Chỉ đoạn tối thiểu tái hiện được lỗi.' },
  { title: 'Chọn đúng thẻ.', text: 'Giúp người biết trả lời tìm thấy bạn.' },
]

// Khối mẹo viết câu hỏi, dùng chung cho trang /ask và modal Đặt câu hỏi
function AskTips() {
  return (
    <aside className="ask-tips">
      <h2 className="ask-tips-title">
        <Lightbulb size={16} /> Viết câu hỏi tốt trong 4 bước
      </h2>
      <ol>
        {TIPS.map((tip, index) => (
          <li key={tip.title}>
            <span>{index + 1}</span>
            <p>
              <b>{tip.title}</b> {tip.text}
            </p>
          </li>
        ))}
      </ol>
    </aside>
  )
}

export default AskTips
