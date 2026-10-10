import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AskQuestionModal from '../components/AskQuestionModal'
import ToastContainer from '../components/ToastContainer'
import './MainLayout.css'

// Khung chung cho mọi trang: Navbar cố định trên đầu, Footer cuối trang,
// nội dung từng trang (Home, Questions, Ask, ...) render qua Outlet.
// key={pathname} làm nội dung remount mỗi lần đổi route, nhờ đó animation
// fade-in-up tự chạy lại mỗi khi chuyển trang.
function MainLayout() {
  const { pathname } = useLocation()

  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        <div key={pathname} className="animate-fade-in-up">
          <Outlet />
        </div>
      </main>
      <Footer />
      <AskQuestionModal />
      <ToastContainer />
    </div>
  )
}

export default MainLayout
