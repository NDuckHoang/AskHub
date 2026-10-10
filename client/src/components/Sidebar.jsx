import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as categoryService from '../services/categoryService'
import * as tagService from '../services/tagService'
import * as userService from '../services/userService'
import Tag from './Tag'
import UserAvatar from './UserAvatar'
import './Sidebar.css'

// Khối dùng chung cho mỗi phần trong sidebar: tiêu đề + nội dung bên trong 1 card
function SidebarSection({ title, children }) {
  return (
    <section className="card sidebar-section">
      <h3 className="sidebar-section-title">{title}</h3>
      {children}
    </section>
  )
}

function SkeletonLines({ count = 5 }) {
  return (
    <div className="sidebar-skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton sidebar-skeleton-line" />
      ))}
    </div>
  )
}

// Sidebar hiển thị ở Home/Questions: Thống kê theo danh mục, Tag phổ biến
// (không lặp lại 1 list "Danh mục" riêng nữa - trang /categories đã là nơi xem đầy đủ)
function Sidebar() {
  const [categories, setCategories] = useState(null)
  const [tags, setTags] = useState(null)
  const [leaderboard, setLeaderboard] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([categoryService.getCategories(), tagService.getPopularTags(8), userService.getLeaderboard(5)])
      .then(([categoriesData, tagsData, leaderboardData]) => {
        setCategories(categoriesData)
        setTags(tagsData)
        setLeaderboard(leaderboardData)
      })
      .catch(() => setError(true))
  }, [])

  const sortedCategories = categories
    ? [...categories].sort((a, b) => b.question_count - a.question_count)
    : null
  const maxCategoryCount = sortedCategories
    ? Math.max(...sortedCategories.map((c) => c.question_count), 1)
    : 1

  return (
    <aside className="sidebar">
      <SidebarSection title="Bảng xếp hạng người dùng">
        {!leaderboard && !error && <SkeletonLines count={5} />}
        {leaderboard && leaderboard.length === 0 && (
          <p className="sidebar-empty">Chưa có dữ liệu xếp hạng.</p>
        )}
        {leaderboard && leaderboard.length > 0 && (
          <ul className="sidebar-leaderboard">
            {leaderboard.map((u, i) => {
              const rankClass = i === 0 ? ' is-gold' : i === 1 ? ' is-silver' : i === 2 ? ' is-bronze' : ''
              return (
                <li key={u.id}>
                  <Link to={`/users/${u.id}`} className={`sidebar-leaderboard-row${rankClass}`}>
                    <span className="sidebar-leaderboard-rank">{i + 1}</span>
                    <UserAvatar username={u.username} avatar={u.avatar} size={24} />
                    <span className="sidebar-leaderboard-name">{u.username}</span>
                    <span className="stat-number sidebar-leaderboard-points">{u.reputation}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </SidebarSection>

      <SidebarSection title="Thống kê theo danh mục">
        {!sortedCategories && !error && <SkeletonLines count={6} />}
        {sortedCategories && (
          <ul className="sidebar-stat-bars">
            {sortedCategories.map((c) => (
              <li key={c.id}>
                <Link to={`/questions?category_id=${c.id}`} className="sidebar-stat-bar-link">
                  <div className="sidebar-stat-bar-row">
                    <span className="sidebar-stat-bar-label">{c.name}</span>
                    <span className="stat-number sidebar-stat-bar-value">{c.question_count}</span>
                  </div>
                  <div className="sidebar-stat-bar-track">
                    <div
                      className="sidebar-stat-bar-fill"
                      style={{ width: `${(c.question_count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link to="/categories" className="sidebar-see-all">
          Xem tất cả danh mục
        </Link>
      </SidebarSection>

      <SidebarSection title="Tag phổ biến">
        {!tags && !error && <SkeletonLines count={4} />}
        {tags && tags.length === 0 && <p className="sidebar-empty">Chưa có tag nào.</p>}
        {tags && tags.length > 0 && (
          <div className="sidebar-tag-list">
            {tags.map((t) => (
              <Tag key={t.id} id={t.id} name={t.name} count={t.question_count} />
            ))}
          </div>
        )}
      </SidebarSection>
    </aside>
  )
}

export default Sidebar
