import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="footer-text">
          AskHub — diễn đàn hỏi đáp lập trình. Đồ án môn học, không dùng cho mục đích thương mại.
        </span>
        <nav className="footer-links">
          <Link to="/questions">Câu hỏi</Link>
          <Link to="/categories">Danh mục</Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
