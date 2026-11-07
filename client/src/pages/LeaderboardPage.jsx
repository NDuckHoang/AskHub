import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Crown, Medal, AlertCircle, Users, ThumbsUp, ThumbsDown, CheckCircle2, Info, Search, X } from 'lucide-react'
import * as userService from '../services/userService'
import { useAuth } from '../hooks/useAuth'
import UserAvatar from '../components/UserAvatar'
import Pagination from '../components/Pagination'
import './LeaderboardPage.css'

const PAGE_SIZE = 20
const SEARCH_DELAY_MS = 300 // chờ người dùng ngừng gõ rồi mới tìm (debounce)

// Thứ tự hiển thị podium: hạng 2 bên trái, hạng 1 ở giữa, hạng 3 bên phải
const PODIUM_ORDER = [1, 0, 2]
const PODIUM_LABELS = ['Quán quân', 'Á quân', 'Hạng ba']

// Quy tắc tính điểm uy tín - PHẢI khớp với server/utils/reputationPoints.js
// (nếu đổi số điểm ở backend thì sửa cả ở đây)
const REPUTATION_RULES = [
  { icon: ThumbsUp, label: 'Câu hỏi được upvote', points: 5 },
  { icon: ThumbsUp, label: 'Câu trả lời được upvote', points: 10 },
  { icon: CheckCircle2, label: 'Câu trả lời được chấp nhận', points: 15 },
  { icon: ThumbsDown, label: 'Câu hỏi bị downvote', points: -2 },
  { icon: ThumbsDown, label: 'Câu trả lời bị downvote', points: -2 },
]

const REPUTATION_NOTES = [
  'Điểm được cộng/trừ cho người đăng nội dung, không phải người bấm vote.',
  'Không thể tự vote cho câu hỏi hay câu trả lời của chính mình.',
  'Bỏ vote hoặc đổi từ upvote sang downvote (và ngược lại) thì điểm được tính lại tương ứng.',
  'Chỉ người đặt câu hỏi mới chấp nhận được câu trả lời. Bỏ chấp nhận hoặc chọn câu trả lời khác thì người cũ bị trừ lại 15 điểm.',
  'Bảng xếp hạng không tính tài khoản Admin và tài khoản đang bị khóa.',
]

function LeaderboardPage() {
  const { user: currentUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  // Từ khóa tìm kiếm lưu trên URL (?q=) để tải lại trang / chia sẻ link vẫn giữ kết quả
  const search = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(search)
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  const fetchPage = useCallback(() => {
    setData(null)
    setError(false)
    userService
      .getLeaderboardPage(page, PAGE_SIZE, search)
      .then(setData)
      .catch(() => setError(true))
  }, [page, search])

  useEffect(() => {
    fetchPage()
  }, [fetchPage])

  // Gõ xong SEARCH_DELAY_MS mới cập nhật URL -> tự tìm, quay về trang 1
  useEffect(() => {
    const keyword = searchInput.trim()
    if (keyword === search) return undefined
    const timer = setTimeout(() => {
      setSearchParams(keyword ? { q: keyword } : {})
    }, SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [searchInput, search, setSearchParams])

  function handlePageChange(nextPage) {
    const params = {}
    if (search) params.q = search
    if (nextPage > 1) params.page = String(nextPage)
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const users = data?.users || []
  // Podium top 3 chỉ hiện ở trang 1 khi KHÔNG tìm kiếm (đang tìm thì kết quả hiện ngay đầu trang).
  // Bảng luôn có đủ mọi người, kể cả top 3 (3 dòng đầu được tô màu vàng/bạc/đồng).
  const showPodium = page === 1 && !search
  const podiumUsers = showPodium ? users.slice(0, 3) : []

  return (
    <div className="container leaderboard-page">
      <div className="leaderboard-head">
        <div>
          <h1 className="leaderboard-title">Bảng xếp hạng cộng đồng</h1>
          <p className="leaderboard-subtitle">Vinh danh những thành viên đóng góp tích cực cho AskHub</p>
        </div>
      </div>

      {error && (
        <div className="card state-box state-error">
          <span className="state-box-icon">
            <AlertCircle size={22} />
          </span>
          <p>Không tải được bảng xếp hạng.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchPage}>
            Thử lại
          </button>
        </div>
      )}

      {!error && data === null && <LeaderboardSkeleton showPodium={showPodium} />}

      {data && users.length === 0 && !search && (
        <div className="card state-box">
          <span className="state-box-icon">
            <Users size={22} />
          </span>
          <p>Chưa có thành viên nào trên bảng xếp hạng.</p>
        </div>
      )}

      {podiumUsers.length > 0 && (
        <section className="podium stagger" aria-label="Top 3">
          {PODIUM_ORDER.filter((index) => podiumUsers[index]).map((index) => {
            const u = podiumUsers[index]
            return (
              <Link key={u.id} to={`/users/${u.id}`} className={`podium-card rank-${index + 1}`}>
                <span className="podium-badge">
                  {index === 0 ? <Crown size={14} /> : <Medal size={14} />}
                  {PODIUM_LABELS[index]}
                </span>
                <span className="podium-avatar">
                  <UserAvatar username={u.username} avatar={u.avatar} size={index === 0 ? 84 : 68} />
                  <span className="podium-rank stat-number">{index + 1}</span>
                </span>
                <span className="podium-name">{u.username}</span>
                <span className="podium-points">
                  <span className="stat-number">{u.reputation.toLocaleString('vi-VN')}</span> điểm
                </span>
                <span className="podium-stats">
                  <span>
                    <b className="stat-number">{u.question_count}</b> hỏi
                  </span>
                  <span>
                    <b className="stat-number">{u.answer_count}</b> trả lời
                  </span>
                  <span>
                    <b className="stat-number">{u.accepted_count}</b> được chấp nhận
                  </span>
                </span>
                <span className="podium-step" aria-hidden="true" />
              </Link>
            )
          })}
        </section>
      )}

      {/* Bảng (trái) + quy tắc tính điểm (phải); màn hẹp thì quy tắc xuống dưới */}
      <div className="leaderboard-body">
        <div className="leaderboard-main">
          <div className="leaderboard-search">
            <Search size={16} className="leaderboard-search-icon" />
            <input
              type="search"
              className="input leaderboard-search-input"
              placeholder="Tìm thành viên theo username..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Tìm thành viên"
            />
            {searchInput && (
              <button
                type="button"
                className="leaderboard-search-clear"
                onClick={() => setSearchInput('')}
                aria-label="Xóa từ khóa"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {search && data && (
            <p className="leaderboard-search-result">
              {data.pagination.total > 0
                ? `Tìm thấy ${data.pagination.total} thành viên cho "${search}"`
                : `Không tìm thấy thành viên nào cho "${search}"`}
            </p>
          )}

          {users.length > 0 && (
            <div className="card leaderboard-table-card">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th scope="col" className="col-rank">Hạng</th>
                    <th scope="col">Thành viên</th>
                    <th scope="col" className="col-num">Điểm uy tín</th>
                    <th scope="col" className="col-num col-optional">Câu hỏi</th>
                    <th scope="col" className="col-num col-optional">Trả lời</th>
                    <th scope="col" className="col-num col-optional">Được chấp nhận</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isMe = currentUser && currentUser.id === u.id
                    // Top 1-3 (theo hạng thật, kể cả khi đang tìm kiếm): tô màu vàng/bạc/đồng + huy chương
                    const isTop3 = u.rank_position <= 3
                    const rowClass = [isTop3 ? `is-rank-${u.rank_position}` : '', isMe ? 'is-me' : '']
                      .filter(Boolean)
                      .join(' ')
                    return (
                      <tr key={u.id} className={rowClass || undefined}>
                        <td className="col-rank stat-number">
                          {isTop3 ? (
                            <span className="leaderboard-medal" title={PODIUM_LABELS[u.rank_position - 1]}>
                              {u.rank_position === 1 ? <Crown size={13} /> : <Medal size={13} />}
                              {u.rank_position}
                            </span>
                          ) : (
                            u.rank_position
                          )}
                        </td>
                        <td>
                          <Link to={`/users/${u.id}`} className="leaderboard-user">
                            <UserAvatar username={u.username} avatar={u.avatar} size={30} />
                            <span className="leaderboard-user-text">
                              <span className="leaderboard-username">
                                {u.username}
                                {isMe && <span className="leaderboard-me">Bạn</span>}
                              </span>
                              {/* Mobile: các cột số phụ bị ẩn, gộp thành 1 dòng mô tả ở đây */}
                              <span className="leaderboard-user-meta">
                                {u.question_count} hỏi · {u.answer_count} trả lời · {u.accepted_count} được chấp nhận
                              </span>
                            </span>
                          </Link>
                        </td>
                        <td className="col-num leaderboard-points stat-number">{u.reputation.toLocaleString('vi-VN')}</td>
                        <td className="col-num col-optional stat-number">{u.question_count}</td>
                        <td className="col-num col-optional stat-number">{u.answer_count}</td>
                        <td className="col-num col-optional stat-number">{u.accepted_count}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {data && (
            <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={handlePageChange} />
          )}
        </div>

        <section className="card reputation-rules" aria-labelledby="reputation-rules-title">
          <h2 id="reputation-rules-title" className="reputation-rules-title">
            <Info size={18} /> Cách tính điểm uy tín
          </h2>

          <ul className="reputation-rule-list">
            {REPUTATION_RULES.map((rule) => (
              <li key={rule.label} className={`reputation-rule${rule.points > 0 ? ' is-plus' : ' is-minus'}`}>
                <span className="reputation-rule-icon">
                  <rule.icon size={16} />
                </span>
                <span className="reputation-rule-label">{rule.label}</span>
                <span className="reputation-rule-points stat-number">
                  {rule.points > 0 ? '+' : '−'}
                  {Math.abs(rule.points)}
                </span>
              </li>
            ))}
          </ul>

          <ul className="reputation-notes">
            {REPUTATION_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function LeaderboardSkeleton({ showPodium }) {
  return (
    <>
      {showPodium && (
        <div className="podium">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`skeleton podium-skeleton${i === 1 ? ' is-first' : ''}`} />
          ))}
        </div>
      )}
      <div className="card leaderboard-table-card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton leaderboard-row-skeleton" />
        ))}
      </div>
    </>
  )
}

export default LeaderboardPage

