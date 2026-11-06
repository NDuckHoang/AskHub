import { useEffect, useState } from 'react'
import { Users, HelpCircle, MessageSquare, MessageCircle, Flag } from 'lucide-react'
import * as adminService from '../services/adminService'
import { useCountUp } from '../hooks/useCountUp'
import './AdminStatsPanel.css'

// Một ô số liệu: số đếm từ 0 lên khi dữ liệu về
function StatBox({ label, value, variant, icon: Icon }) {
  const shown = useCountUp(value)
  return (
    <div className={`card lift admin-stat-box admin-stat-box-${variant}`}>
      <span className="admin-stat-icon">
        <Icon size={16} />
      </span>
      <span className="admin-stat-value stat-number">{shown ?? '-'}</span>
      <span className="admin-stat-label">{label}</span>
    </div>
  )
}

// 4 số liệu tổng quan + báo cáo chờ xử lý, không làm dashboard cầu kỳ (đúng mục 15)
function AdminStatsPanel() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminService.getStats().then(setStats).catch(() => {})
  }, [])

  // variant: phân nhóm màu nền - người dùng (xanh lá), nội dung (xanh dương),
  // báo cáo chờ xử lý (đỏ, cần chú ý)
  const items = [
    { label: 'Tổng người dùng', value: stats?.totalUsers, variant: 'green', icon: Users },
    { label: 'Tổng câu hỏi', value: stats?.totalQuestions, variant: 'blue', icon: HelpCircle },
    { label: 'Tổng câu trả lời', value: stats?.totalAnswers, variant: 'blue', icon: MessageSquare },
    { label: 'Tổng bình luận', value: stats?.totalComments, variant: 'blue', icon: MessageCircle },
    { label: 'Báo cáo chờ xử lý', value: stats?.pendingReports, variant: 'red', icon: Flag },
  ]

  return (
    <div className="admin-stats-grid stagger">
      {items.map((item) => (
        <StatBox key={item.label} {...item} />
      ))}
    </div>
  )
}

export default AdminStatsPanel
