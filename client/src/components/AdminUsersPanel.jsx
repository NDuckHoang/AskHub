import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Unlock, Trash2 } from 'lucide-react'
import * as adminService from '../services/adminService'
import { useAuth } from '../hooks/useAuth'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../hooks/useToast'
import UserAvatar from './UserAvatar'
import Pagination from './Pagination'
import ExportButton from './ExportButton'
import './AdminRowList.css'
import './AdminUsersPanel.css'

function AdminUsersPanel() {
  const { user: currentUser } = useAuth()
  const confirm = useConfirm()
  const showToast = useToast()
  const [users, setUsers] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')

  const fetchUsers = useCallback(() => {
    setUsers(null)
    setError(false)
    adminService
      .getUsers({ search: search || undefined, page, limit: 10 })
      .then((data) => {
        setUsers(data.users)
        setPagination(data.pagination)
      })
      .catch(() => setError(true))
  }, [search, page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  async function handleToggleStatus(u) {
    setActionError('')
    const newStatus = u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
    try {
      await adminService.updateUserStatus(u.id, newStatus)
      fetchUsers()
      showToast(newStatus === 'BLOCKED' ? `Đã khóa tài khoản "${u.username}"` : `Đã mở khóa tài khoản "${u.username}"`)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Thao tác thất bại')
    }
  }

  async function handleDelete(u) {
    const ok = await confirm({
      title: 'Xóa người dùng',
      message: `Xóa người dùng "${u.username}"? Toàn bộ câu hỏi/trả lời/bình luận của họ cũng sẽ bị xóa.`,
      danger: true,
    })
    if (!ok) return
    setActionError('')
    try {
      await adminService.deleteUser(u.id)
      fetchUsers()
      showToast(`Đã xóa người dùng "${u.username}"`)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Xóa thất bại')
    }
  }

  return (
    <div>
      <div className="admin-panel-toolbar">
        <ExportButton
          label="Xuất Excel"
          filterSummary={search ? `tìm kiếm "${search}"` : ''}
          fields={[
            {
              name: 'role',
              label: 'Vai trò',
              options: [
                { value: '', label: 'Tất cả' },
                { value: 'USER', label: 'User' },
                { value: 'ADMIN', label: 'Admin' },
              ],
            },
            {
              name: 'status',
              label: 'Trạng thái',
              options: [
                { value: '', label: 'Tất cả' },
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'BLOCKED', label: 'Đã khóa' },
              ],
            },
          ]}
          onExport={(extra) => adminService.exportUsers({ search: search || undefined, ...extra })}
        />
      </div>

      <form className="admin-search-form" onSubmit={handleSearchSubmit}>
        <input
          className="input admin-search-input"
          placeholder="Tìm theo username hoặc email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary btn-sm">
          Tìm
        </button>
      </form>

      {actionError && <div className="auth-error">{actionError}</div>}

      {users === null && !error && <div className="skeleton" style={{ height: 240, borderRadius: 8 }} />}

      {error && (
        <div className="card state-box state-error">
          <p>Không tải được danh sách người dùng.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchUsers}>
            Thử lại
          </button>
        </div>
      )}

      {users && users.length === 0 && (
        <div className="card state-box">
          <p>Không tìm thấy người dùng nào.</p>
        </div>
      )}

      {users && users.length > 0 && (
        <div className="card admin-user-list">
          {users.map((u) => (
            <div key={u.id} className="admin-user-row">
              <Link to={`/users/${u.id}`} className="admin-user-link">
                <UserAvatar username={u.username} size={32} />
                <div className="admin-user-info">
                  <span className="admin-user-name">
                    {u.username}
                    {u.role === 'ADMIN' && <span className="admin-role-badge">Admin</span>}
                    {u.status === 'BLOCKED' && <span className="admin-status-badge">Đã khóa</span>}
                  </span>
                  <span className="admin-user-email">{u.email}</span>
                </div>
              </Link>
              <span className="admin-user-reputation stat-number">{u.reputation} điểm</span>
              <div className="admin-user-actions">
                {u.id !== currentUser.id && (
                  <>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleToggleStatus(u)}
                    >
                      {u.status === 'ACTIVE' ? (
                        <>
                          <Lock size={14} /> Khóa
                        </>
                      ) : (
                        <>
                          <Unlock size={14} /> Mở khóa
                        </>
                      )}
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>
                      <Trash2 size={14} /> Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
    </div>
  )
}

export default AdminUsersPanel
