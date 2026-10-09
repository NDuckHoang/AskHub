import { useEffect, useState } from 'react'
import AdminStatsPanel from '../components/AdminStatsPanel'
import AdminChartsPanel from '../components/AdminChartsPanel'
import AdminUsersPanel from '../components/AdminUsersPanel'
import AdminQuestionsPanel from '../components/AdminQuestionsPanel'
import AdminAnswersPanel from '../components/AdminAnswersPanel'
import AdminCategoriesPanel from '../components/AdminCategoriesPanel'
import AdminReportsPanel from '../components/AdminReportsPanel'
import * as adminService from '../services/adminService'
import '../components/QuestionSortBar.css'
import './AdminPage.css'

const TABS = [
  { value: 'users', label: 'Người dùng' },
  { value: 'questions', label: 'Câu hỏi' },
  { value: 'answers', label: 'Câu trả lời' },
  { value: 'categories', label: 'Danh mục' },
  { value: 'reports', label: 'Báo cáo' },
]

function AdminPage() {
  const [tab, setTab] = useState('users')
  const [pendingReports, setPendingReports] = useState(0)

  useEffect(() => {
    adminService.getStats().then((s) => setPendingReports(s.pendingReports)).catch(() => {})
  }, [tab])

  return (
    <div className="container admin-page">
      <h1>Quản trị</h1>

      <AdminStatsPanel />
      <AdminChartsPanel />

      <div className="question-sort-tabs admin-page-tabs">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`question-sort-tab${tab === t.value ? ' is-active' : ''}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
            {t.value === 'reports' && pendingReports > 0 && (
              <span className="admin-tab-badge">{pendingReports}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'users' && <AdminUsersPanel />}
      {tab === 'questions' && <AdminQuestionsPanel />}
      {tab === 'answers' && <AdminAnswersPanel />}
      {tab === 'categories' && <AdminCategoriesPanel />}
      {tab === 'reports' && <AdminReportsPanel />}
    </div>
  )
}

export default AdminPage
