import { ChevronUp, ChevronDown } from 'lucide-react'
import './VoteButton.css'

// Nút vote dọc dùng chung cho question và answer: ▲ số ▼
// size="sm" dùng cho answer để nhỏ hơn question, tạo thứ bậc rõ ràng
function VoteButton({ voteCount, myVote, onVote, disabled, size = 'md' }) {
  const iconSize = size === 'sm' ? 16 : 20

  return (
    <div className={`vote-button vote-button-${size}`}>
      <button
        type="button"
        className={`vote-btn${myVote === 1 ? ' is-active-up' : ''}`}
        onClick={() => onVote(1)}
        disabled={disabled}
        aria-label="Upvote"
        title={disabled ? 'Đăng nhập để vote' : 'Upvote'}
      >
        <ChevronUp size={iconSize} />
      </button>

      <span className="vote-count stat-number">{voteCount}</span>

      <button
        type="button"
        className={`vote-btn${myVote === -1 ? ' is-active-down' : ''}`}
        onClick={() => onVote(-1)}
        disabled={disabled}
        aria-label="Downvote"
        title={disabled ? 'Đăng nhập để vote' : 'Downvote'}
      >
        <ChevronDown size={iconSize} />
      </button>
    </div>
  )
}

export default VoteButton
