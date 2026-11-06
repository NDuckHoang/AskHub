import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Hourglass, ArrowUp, ArrowRight, MessageSquareReply, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import * as questionService from '../services/questionService'
import * as categoryService from '../services/categoryService'
import CategoryIcon from './CategoryIcon'
import { formatRelativeTime } from '../utils/formatTime'
import './HomeHighlights.css'

const ITEM_COUNT = 3
const HOT_DAYS = 7
const TOPIC_COUNT = 4

// Gộp 2 danh sách, bỏ câu trùng, lấy tối đa ITEM_COUNT câu (danh sách đầu được ưu tiên)
function mergeUnique(first, second) {
  const ids = new Set(first.map((q) => q.id))
  return [...first, ...second.filter((q) => !ids.has(q.id))].slice(0, ITEM_COUNT)
}

// 3 khối nổi bật ở trang chủ, mỗi khối một cách trình bày để trang có nhịp điệu.
// Dữ liệu thật từ API:
//  - Đang hot: nhiều vote nhất trong 7 ngày, thiếu thì bù bằng câu nhiều vote nhất mọi lúc
//  - Đang chờ bạn: câu hỏi chưa có câu trả lời
//  - Chủ đề hot: GET /api/categories/trending (danh mục sôi nổi nhất + xu hướng)
function HomeHighlights() {
  const [hot, setHot] = useState(null)
  const [waiting, setWaiting] = useState(null)
  const [topics, setTopics] = useState(null)
  const [topicDays, setTopicDays] = useState(30)

  useEffect(() => {
    Promise.all([
      questionService.getQuestions({ sort: 'votes', days: HOT_DAYS, page: 1, limit: ITEM_COUNT }),
      questionService.getQuestions({ sort: 'votes', page: 1, limit: ITEM_COUNT }),
    ])
      .then(([recent, allTime]) => setHot(mergeUnique(recent.questions, allTime.questions)))
      .catch(() => setHot([]))

    questionService
      .getQuestions({ sort: 'unanswered', page: 1, limit: ITEM_COUNT })
      .then((data) => setWaiting(data.questions))
      .catch(() => setWaiting([]))

    categoryService
      .getTrendingCategories(TOPIC_COUNT)
      .then((data) => {
        setTopics(data.categories)
        setTopicDays(data.days)
      })
      .catch(() => setTopics([]))
  }, [])

  return (
    <section className="home-highlights stagger" aria-label="Nổi bật">
      {/* Khối 1: Đang hot - số thứ hạng lớn + số vote */}
      <div className="highlight-block is-hot">
        <HighlightHeader
          icon={<Flame size={18} />}
          title="Đang hot"
          subtitle="Được bình chọn nhiều nhất"
          moreTo="/questions?sort=votes"
        />
        <HighlightList items={hot} emptyText="Chưa có câu hỏi nào được vote.">
          {(q, index) => (
            <Link key={q.id} to={`/questions/${q.id}`} className="highlight-row">
              <span className="highlight-rank stat-number">{index + 1}</span>
              <span className="highlight-row-title">{q.title}</span>
              <span className="highlight-votes stat-number">
                <ArrowUp size={13} />
                {q.vote_count}
              </span>
            </Link>
          )}
        </HighlightList>
      </div>

      {/* Khối 2: Đang chờ bạn - nền cam nhạt, kêu gọi trả lời */}
      <div className="highlight-block is-waiting">
        <HighlightHeader
          icon={<Hourglass size={18} />}
          title="Đang chờ bạn"
          subtitle="Chưa có câu trả lời nào"
          moreTo="/questions?sort=unanswered"
        />
        <HighlightList items={waiting} emptyText="Mọi câu hỏi đều đã có câu trả lời.">
          {(q) => (
            <Link key={q.id} to={`/questions/${q.id}`} className="highlight-row">
              <CategoryIcon name={q.category_name} size={28} />
              <span className="highlight-row-text">
                <span className="highlight-row-title">{q.title}</span>
                <span className="highlight-row-meta">{formatRelativeTime(q.created_at)}</span>
              </span>
              <span className="highlight-answer-cta">
                <MessageSquareReply size={14} /> Trả lời
              </span>
            </Link>
          )}
        </HighlightList>
      </div>

      {/* Khối 3: Chủ đề hot - danh mục sôi nổi nhất, kèm chỉ báo xu hướng */}
      <div className="highlight-block is-topics">
        <HighlightHeader
          icon={<TrendingUp size={18} />}
          title="Chủ đề hot"
          subtitle={`Sôi nổi nhất ${topicDays} ngày qua`}
          moreTo="/categories"
        />
        <HighlightList items={topics} emptyText="Chưa có chủ đề nào có câu hỏi." skeletonCount={TOPIC_COUNT}>
          {(topic) => (
            <Link key={topic.id} to={`/questions?category_id=${topic.id}`} className="highlight-row topic-row">
              <CategoryIcon name={topic.name} size={34} />
              <span className="highlight-row-text">
                <span className="topic-name">{topic.name}</span>
                <span className="highlight-row-meta">
                  {topic.question_count} câu hỏi · {topic.answer_count + topic.comment_count} thảo luận
                </span>
              </span>
              <TopicTrend recent={topic.recent_questions} previous={topic.previous_questions} days={topicDays} />
            </Link>
          )}
        </HighlightList>
        <Link to="/categories" className="highlight-footer-link">
          Khám phá tất cả chủ đề <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}

function HighlightHeader({ icon, title, subtitle, moreTo }) {
  return (
    <div className="highlight-header">
      <span className="highlight-header-icon">{icon}</span>
      <div className="highlight-header-text">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <Link to={moreTo} className="highlight-more" aria-label={`Xem thêm: ${title}`}>
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}

// Chỉ báo xu hướng: so số câu hỏi mới trong `days` ngày gần nhất với `days` ngày liền trước.
// Cả 2 kỳ đều 0 thì không có dữ liệu để so -> không hiển thị gì.
function TopicTrend({ recent, previous, days }) {
  if (recent === 0 && previous === 0) return null

  const diff = recent - previous
  const title = `${recent} câu hỏi trong ${days} ngày qua, ${previous} câu ở ${days} ngày trước đó`

  if (diff > 0) {
    return (
      <span className="topic-trend is-up" title={title}>
        <TrendingUp size={13} /> +{diff}
      </span>
    )
  }
  if (diff < 0) {
    return (
      <span className="topic-trend is-down" title={title}>
        <TrendingDown size={13} /> {diff}
      </span>
    )
  }
  return (
    <span className="topic-trend" title={title}>
      <Minus size={13} /> 0
    </span>
  )
}

// items = null: đang tải (skeleton); [] : trống; còn lại: gọi children(item, index) cho từng mục
function HighlightList({ items, emptyText, children, skeletonCount = ITEM_COUNT }) {
  if (items === null) {
    return (
      <div className="highlight-list">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="skeleton highlight-skeleton" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return <p className="highlight-empty">{emptyText}</p>
  }

  return <div className="highlight-list">{items.map((q, index) => children(q, index))}</div>
}

export default HomeHighlights
