import { useState } from 'react'

export default function GlowButton({ children, variant = 'primary', href = '#', className = '' }: { children: React.ReactNode; variant?: 'primary' | 'secondary' | 'outline'; href?: string; className?: string }) {
  const [h, setH] = useState(false)
  const styles = {
    primary: { bg: '#F59E0B', color: '#020617', hoverBg: '#D97706', glow: 'rgba(245,158,11,0.4)' },
    secondary: { bg: '#1E3A5F', color: '#fff', hoverBg: '#162D4A', glow: 'rgba(30,58,95,0.4)' },
    outline: { bg: 'transparent', color: '#1E3A5F', hoverBg: '#1E3A5F', glow: 'rgba(30,58,95,0.3)' },
  }[variant]
  return (
    <a href={href} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className={`relative inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold overflow-hidden no-underline ${className}`}
      style={{
        background: h && variant === 'outline' ? styles.hoverBg : styles.bg,
        color: h && variant === 'outline' ? '#fff' : styles.color,
        border: variant === 'outline' ? '2px solid #1E3A5F' : 'none',
        transform: h ? 'scale(1.04)' : 'scale(1)',
        boxShadow: h ? `0 0 24px ${styles.glow}, 0 0 48px ${styles.glow.replace('0.4','0.15').replace('0.3','0.1')}` : 'none',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
      <span className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)',
        transform: 'skewX(-20deg)', left: h ? '130%' : '-80%',
        transition: 'left 0.65s ease', top: '-50%', width: '50%', height: '200%', position: 'absolute',
      }} />
      <span className="relative z-10">{children}</span>
    </a>
  )
}
