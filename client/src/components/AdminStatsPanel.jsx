import { useEffect, useState } from 'react'
import * as adminService from '../services/adminService'
import './AdminStatsPanel.css'

// 4 số liệu tổng quan, không làm dashboard/biểu đồ cầu kỳ (đúng mục 15)
function AdminStatsPanel() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminService.getStats().then(setStats).catch(() => {})
  }, [])

  // variant: phân nhóm màu nền - người dùng (xanh lá), nội dung (xanh dương),
  // báo cáo chờ xử lý (đỏ, cần chú ý) - theo đúng yêu cầu phân loại trực quan
  const items = [
    { label: 'Tổng người dùng', value: stats?.totalUsers, variant: 'green' },
    { label: 'Tổng câu hỏi', value: stats?.totalQuestions, variant: 'blue' },
    { label: 'Tổng câu trả lời', value: stats?.totalAnswers, variant: 'blue' },
    { label: 'Tổng bình luận', value: stats?.totalComments, variant: 'blue' },
    { label: 'Báo cáo chờ xử lý', value: stats?.pendingReports, variant: 'red' },
  ]

  return (
    <div className="admin-stats-grid">
      {items.map((item) => (
        <div key={item.label} className={`card admin-stat-box admin-stat-box-${item.variant}`}>
          <span className="admin-stat-value stat-number">{item.value ?? '-'}</span>
          <span className="admin-stat-label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default AdminStatsPanel
