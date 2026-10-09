import { useEffect, useState } from 'react'
import * as adminService from '../services/adminService'
import './AdminStatsPanel.css'

// 4 số liệu tổng quan, không làm dashboard/biểu đồ cầu kỳ (đúng mục 15)
function AdminStatsPanel() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminService.getStats().then(setStats).catch(() => {})
  }, [])

  const items = [
    { label: 'Tổng người dùng', value: stats?.totalUsers },
    { label: 'Tổng câu hỏi', value: stats?.totalQuestions },
    { label: 'Tổng câu trả lời', value: stats?.totalAnswers },
    { label: 'Tổng bình luận', value: stats?.totalComments },
    { label: 'Báo cáo chờ xử lý', value: stats?.pendingReports },
  ]

  return (
    <div className="admin-stats-grid">
      {items.map((item) => {
        // Chỉ "Báo cáo chờ xử lý" mới cần nhấn mạnh bằng vàng nhạt khi > 0 - đây là số
        // liệu cần hành động, không phải số liệu thống kê thuần túy như 4 ô còn lại
        const needsAttention = item.label === 'Báo cáo chờ xử lý' && item.value > 0
        return (
          <div
            key={item.label}
            className={`card admin-stat-box${needsAttention ? ' admin-stat-box-attention' : ''}`}
          >
            <span className="admin-stat-value stat-number">{item.value ?? '-'}</span>
            <span className="admin-stat-label">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default AdminStatsPanel
