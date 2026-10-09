import { Link } from 'react-router-dom'
import homeBanner from '../assets/home-banner.png'
import './WelcomeBanner.css'

// Banner quảng bá ở đầu trang chủ - ảnh do người dùng tự thiết kế, bấm vào để sang trang đăng ký
function WelcomeBanner() {
  return (
    <Link to="/register" className="welcome-banner">
      <img src={homeBanner} alt="AskHub - Cộng đồng hỏi đáp lập trình hàng đầu Việt Nam" />
    </Link>
  )
}

export default WelcomeBanner
