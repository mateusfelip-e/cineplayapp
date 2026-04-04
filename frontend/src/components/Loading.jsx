import './Loading.css'

function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-logo">
        <span className="loading-cine">Cine</span>
        <span className="loading-play">Play</span>
      </div>
      <div className="loading-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

export default Loading