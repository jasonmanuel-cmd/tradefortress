import { ImageResponse } from 'next/og'

export const alt = 'Trade Fortress command center for trade businesses'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '76px',
        color: '#F5F7FA',
        background: 'linear-gradient(135deg, #050814 0%, #0A2342 58%, #073B3A 100%)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ color: '#00E5FF', fontSize: 28, fontWeight: 800, letterSpacing: 5, textTransform: 'uppercase' }}>
        Built for trade-service businesses
      </div>
      <div style={{ marginTop: 28, maxWidth: 980, fontSize: 82, fontWeight: 900, lineHeight: 1 }}>
        Trade Fortress
      </div>
      <div style={{ marginTop: 24, maxWidth: 950, color: '#D7DEEA', fontSize: 38, lineHeight: 1.2 }}>
        Protect leads. Run jobs. Keep the paperwork ready.
      </div>
      <div style={{ marginTop: 54, color: '#FFD166', fontSize: 24, fontWeight: 700 }}>
        One command center for the whole operation.
      </div>
    </div>,
    size,
  )
}
