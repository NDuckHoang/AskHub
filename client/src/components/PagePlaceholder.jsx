// Trang tạm cho các route chưa được xây ở bước này, tránh tình trạng
// bấm link mà không thấy gì đổi (mọi route trước đây đều render chung 1 trang).
function PagePlaceholder({ title }) {
  return (
    <div className="container">
      <div className="state-box" style={{ marginTop: 32 }}>
        <h2>{title}</h2>
        <p>Trang này sẽ được hoàn thiện ở bước tiếp theo.</p>
      </div>
    </div>
  )
}

export default PagePlaceholder
