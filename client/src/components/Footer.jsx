import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="footer-text">AskHub — diễn đàn hỏi đáp lập trình.</span>
        <nav className="footer-links">
          <Link to="/">Trang chủ</Link>
          <Link to="/questions">Câu hỏi</Link>
          <Link to="/categories">Danh mục</Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
