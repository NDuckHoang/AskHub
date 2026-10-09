import './SimpleBarChart.css'

// Biểu đồ cột ngang đơn giản, chỉ dùng HTML/CSS (không dùng thư viện vẽ biểu đồ).
// data: [{ label, value }]
function SimpleBarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="simple-bar-chart">
      {data.map((d) => (
        <div key={d.label} className="simple-bar-row">
          <span className="simple-bar-label">{d.label}</span>
          <div className="simple-bar-track">
            <div className="simple-bar-fill" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="simple-bar-value stat-number">{d.value}</span>
        </div>
      ))}
    </div>
  )
}

export default SimpleBarChart
