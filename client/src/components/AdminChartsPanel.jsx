import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart2, Activity, Flag, ChevronRight } from 'lucide-react'
import * as adminService from '../services/adminService'
import * as categoryService from '../services/categoryService'
import './AdminChartsPanel.css'

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function dayLabel(dateStr) {
  const d = new Date(dateStr)
  return WEEKDAY_LABELS[d.getDay()]
}

// Biểu đồ cho trang Admin: câu hỏi theo danh mục + hoạt động 7 ngày gần đây.
// Chỉ dùng HTML/CSS tự vẽ, không thêm thư viện biểu đồ ngoài.
function AdminChartsPanel() {
  const [categories, setCategories] = useState(null)
  const [activity, setActivity] = useState(null)
  const [pendingReports, setPendingReports] = useState(null)

  useEffect(() => {
    adminService.getStats().then((st) => setPendingReports(st.pendingReports)).catch(() => {})
    categoryService.getCategories().then(setCategories).catch(() => setCategories([]))
    adminService
      .getActivityStats()
      .then((data) => setActivity(data.days))
      .catch(() => setActivity([]))
  }, [])

  const categoryData = (categories || [])
    .filter((c) => c.question_count > 0)
    .sort((a, b) => b.question_count - a.question_count)
    .map((c) => ({ label: c.name, value: c.question_count }))

  const activityMax = activity ? Math.max(1, ...activity.map((d) => Math.max(d.questions, d.answers))) : 1

  return (
    <div className="admin-charts-grid">
      <div className="card admin-chart-box">
        <h3 className="admin-chart-title">
          <BarChart2 size={15} /> Câu hỏi theo danh mục
        </h3>
        {categories === null && <div className="skeleton" style={{ height: 160, borderRadius: 8 }} />}
        {categories && categoryData.length === 0 && (
          <p className="admin-chart-empty">Chưa có câu hỏi nào được phân loại.</p>
        )}
        {categories && categoryData.length > 0 && (
          <div className="admin-column-chart">
            {categoryData.slice(0, 8).map((d, i) => (
              <div key={d.label} className="admin-column" title={`${d.label}: ${d.value} câu hỏi`}>
                <span className="admin-column-value stat-number">{d.value}</span>
                <div
                  className={`admin-column-bar${i === 0 ? ' is-top' : ''}`}
                  style={{ height: `${(d.value / categoryData[0].value) * 100}%` }}
                />
                <span className="admin-column-label">{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card admin-chart-box admin-todo-box">
        <h3 className="admin-chart-title">Cần xử lý</h3>
        <Link to="/admin/reports" className={`admin-todo-row${pendingReports > 0 ? ' is-alert' : ''}`}>
          <span className="admin-todo-count stat-number">{pendingReports ?? '-'}</span>
          <span className="admin-todo-label">
            <Flag size={14} /> Báo cáo vi phạm chờ xử lý
          </span>
          <span className="admin-todo-link">
            Xem <ChevronRight size={14} />
          </span>
        </Link>
      </div>

      <div className="card admin-chart-box admin-activity-box">
        <h3 className="admin-chart-title">
          <Activity size={15} /> Hoạt động 7 ngày gần đây
        </h3>
        {activity === null && <div className="skeleton" style={{ height: 160, borderRadius: 8 }} />}
        {activity && activity.length > 0 && (
          <>
            <div className="activity-chart">
              {activity.map((d) => (
                <div key={d.day} className="activity-chart-col">
                  <div className="activity-chart-bars">
                    <div
                      className="activity-bar activity-bar-question"
                      style={{ height: `${(d.questions / activityMax) * 100}%` }}
                      title={`${d.questions} câu hỏi`}
                    />
                    <div
                      className="activity-bar activity-bar-answer"
                      style={{ height: `${(d.answers / activityMax) * 100}%` }}
                      title={`${d.answers} câu trả lời`}
                    />
                  </div>
                  <span className="activity-chart-day-label">{dayLabel(d.day)}</span>
                </div>
              ))}
            </div>
            <div className="activity-chart-legend">
              <span><i className="activity-bar activity-bar-question" /> Câu hỏi</span>
              <span><i className="activity-bar activity-bar-answer" /> Câu trả lời</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminChartsPanel
