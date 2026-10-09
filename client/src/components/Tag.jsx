import { Link } from 'react-router-dom'
import './Tag.css'

// Dùng chung cho: tag trên QuestionItem, tag trong sidebar "Tag phổ biến", tag trong form Ask
function Tag({ id, name, count, clickable = true }) {
  const content = (
    <>
      {name}
      {typeof count === 'number' && <span className="tag-count">{count}</span>}
    </>
  )

  if (!clickable) {
    return <span className="tag-pill">{content}</span>
  }

  return (
    <Link className="tag-pill" to={`/questions?tag_id=${id}`}>
      {content}
    </Link>
  )
}

export default Tag
