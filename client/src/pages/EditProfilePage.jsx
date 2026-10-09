import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import * as userService from '../services/userService'
import * as uploadService from '../services/uploadService'
import UserAvatar from '../components/UserAvatar'
import './EditProfilePage.css'

const GENDER_OPTIONS = [
  { value: '', label: 'Không muốn tiết lộ' },
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function EditProfilePage() {
  const { id } = useParams()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [email, setEmail] = useState(user?.email || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [gender, setGender] = useState(user?.gender || '')
  const [contact, setContact] = useState(user?.contact || '')

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!user || String(user.id) !== id) {
    return (
      <div className="container">
        <div className="card state-box state-error">
          <p>Bạn không có quyền sửa hồ sơ này.</p>
        </div>
      </div>
    )
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return

    setUploadingAvatar(true)
    try {
      const url = await uploadService.uploadImage(file)
      setAvatar(url)
    } catch {
      setSubmitError('Tải ảnh đại diện thất bại, vui lòng thử lại')
    } finally {
      setUploadingAvatar(false)
    }
  }

  function validate() {
    const next = {}
    if (!EMAIL_REGEX.test(email.trim())) {
      next.email = 'Email không đúng định dạng'
    }
    if (bio.length > 500) {
      next.bio = 'Giới thiệu bản thân tối đa 500 ký tự'
    }
    if (contact.length > 255) {
      next.contact = 'Thông tin liên hệ tối đa 255 ký tự'
    }
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      const data = await userService.updateProfile(id, {
        avatar: avatar || null,
        email: email.trim(),
        bio: bio.trim(),
        gender: gender || null,
        contact: contact.trim(),
      })
      updateUser(data.user)
      navigate(`/users/${id}`)
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
      setSubmitting(false)
    }
  }

  return (
    <div className="container edit-profile-page">
      <h1>Chỉnh sửa hồ sơ</h1>

      <form className="card edit-profile-card" onSubmit={handleSubmit} noValidate>
        {submitError && <div className="auth-error">{submitError}</div>}

        <div className="edit-profile-avatar-row">
          <UserAvatar username={user.username} avatar={avatar} size={72} />
          <div>
            <label className="btn btn-secondary btn-sm edit-profile-avatar-btn">
              <Camera size={14} /> {uploadingAvatar ? 'Đang tải...' : 'Đổi ảnh đại diện'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
                hidden
              />
            </label>
            {avatar && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setAvatar('')}
                disabled={uploadingAvatar}
              >
                Xóa ảnh
              </button>
            )}
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="username">
            Username
          </label>
          <input id="username" className="input" value={user.username} disabled />
          <span className="field-hint">Không thể đổi username</span>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`input${errors.email ? ' has-error' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="gender">
            Giới tính
          </label>
          <select id="gender" className="select" value={gender} onChange={(e) => setGender(e.target.value)}>
            {GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="contact">
            Liên hệ
          </label>
          <input
            id="contact"
            className={`input${errors.contact ? ' has-error' : ''}`}
            placeholder="Số điện thoại, GitHub, website..."
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
          {errors.contact && <span className="field-error">{errors.contact}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="bio">
            Giới thiệu bản thân
          </label>
          <textarea
            id="bio"
            className={`textarea${errors.bio ? ' has-error' : ''}`}
            rows={4}
            placeholder="Vài dòng giới thiệu về bạn, kinh nghiệm, công nghệ đang dùng..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
          />
          {errors.bio && <span className="field-error">{errors.bio}</span>}
          <span className="field-hint">{bio.length}/500 ký tự</span>
        </div>

        <div className="edit-profile-actions">
          <Link to={`/users/${id}`} className="btn btn-secondary">
            Hủy
          </Link>
          <button type="submit" className="btn btn-primary" disabled={submitting || uploadingAvatar}>
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditProfilePage
