import './ending-home.css'

export function EndingHomeButton({ onHome }: { onHome: () => void }) {
  return (
    <div className="ending-home-row">
      <button type="button" className="ending-home-button" onClick={onHome}>
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M4 15 16 5l12 10M8 13v14h16V13M13 27V17h6v10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        回到首页
      </button>
    </div>
  )
}
