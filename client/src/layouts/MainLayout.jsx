import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AskQuestionModal from '../components/AskQuestionModal'
import './MainLayout.css'

// Khung chung cho mọi trang: Navbar cố định trên đầu, Footer cuối trang,
// nội dung từng trang (Home, Questions, Ask, ...) render qua Outlet
function MainLayout() {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <AskQuestionModal />
    </div>
  )
}

export default MainLayout
