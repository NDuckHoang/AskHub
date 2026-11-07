import { Outlet, useLocation } from 'react-router-dom'
import AppRail from '../components/AppRail'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AskQuestionModal from '../components/AskQuestionModal'
import ToastContainer from '../components/ToastContainer'
import { useIsDesktop } from '../hooks/useIsDesktop'
import './MainLayout.css'

// Khung chung cho mọi trang: AppRail (điều hướng dọc, chỉ desktop) bên trái,
// bên phải là Navbar (search + tài khoản) + nội dung trang + Footer.
// key={pathname} làm nội dung remount mỗi lần đổi route, nhờ đó animation
// fade-in-up tự chạy lại mỗi khi chuyển trang.
function MainLayout() {
  const { pathname } = useLocation()
  // Sidebar trái chỉ có ở desktop -> chỉ tạo khi đang ở desktop (tránh chạy ngầm + gọi API thừa trên mobile)
  const isDesktop = useIsDesktop()

  return (
    <div className="main-layout">
      {isDesktop && <AppRail />}
      <div className="main-layout-right">
        <Navbar />
        <main className="main-content">
          <div key={pathname} className="animate-fade-in-up">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
      <AskQuestionModal />
      <ToastContainer />
    </div>
  )
}

export default MainLayout
