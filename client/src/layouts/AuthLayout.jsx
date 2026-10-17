import { Link, Outlet, useLocation } from 'react-router-dom'
import { MessagesSquare, Lightbulb, TrendingUp } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import ToastContainer from '../components/ToastContainer'
import logoIcon from '../assets/logo-icon.png'
import './AuthLayout.css'

// Layout riêng cho /login và /register - split-screen: cột trái quảng bá thương
// hiệu AskHub, cột phải là form. KHÔNG dùng AppRail/Navbar đầy đủ của trang chủ
// (không sidebar, không search toàn cục, không nút "Đặt câu hỏi").
function AuthLayout() {
  const { pathname } = useLocation()

  return (
    <div className="auth-layout">
      <div className="auth-banner">
        <Link to="/" className="auth-banner-logo">
          <img src={logoIcon} alt="" />
          AskHub
        </Link>

        <div className="auth-banner-body">
          <h1>
            Code together.
            <br />
            Grow together.
          </h1>
          <p className="auth-banner-desc">
            Nơi lập trình viên đặt câu hỏi, chia sẻ kiến thức và cùng nhau giải quyết những vấn đề
            khó.
          </p>
          <ul className="auth-banner-points">
            <li>
              <span className="auth-banner-point-icon">
                <MessagesSquare size={16} />
              </span>
              Cộng đồng hỏi đáp lập trình
            </li>
            <li>
              <span className="auth-banner-point-icon">
                <Lightbulb size={16} />
              </span>
              Chia sẻ kiến thức và kinh nghiệm
            </li>
            <li>
              <span className="auth-banner-point-icon">
                <TrendingUp size={16} />
              </span>
              Học hỏi và phát triển kỹ năng
            </li>
          </ul>
        </div>
      </div>

      <div className="auth-panel">
        <header className="auth-panel-header">
          <ThemeToggle />
        </header>

        <main className="auth-main">
          <div key={pathname} className="animate-fade-in-up auth-main-inner">
            <Outlet />
          </div>
        </main>

        <footer className="auth-footer">AskHub — diễn đàn hỏi đáp lập trình.</footer>
      </div>

      <ToastContainer />
    </div>
  )
}

export default AuthLayout
