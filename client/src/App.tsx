import './App.css'

function App() {
  return (
    <main className="shell">
      <span className="eyebrow">BUS MANAGEMENT</span>
      <h1>Quản lý xe khách</h1>
      <p className="intro">Nền tảng quản lý tuyến xe, phương tiện và lịch vận hành.</p>
      <section className="status-panel" aria-label="Trạng thái hệ thống">
        <span className="status-dot" />
        <div>
          <strong>Dự án đã khởi tạo</strong>
          <p>API và giao diện sẵn sàng để phát triển nghiệp vụ.</p>
        </div>
      </section>
    </main>
  )
}

export default App
