import { useRef, useState, useEffect } from 'react'

export function StaggerChildren({ children, className = '', staggerDelay = 0.08 }: { children: React.ReactNode[]; className?: string; staggerDelay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1, rootMargin: '-30px 0px' })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <div key={i} style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(24px)',
          transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * staggerDelay}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * staggerDelay}s`,
        }}>{child}</div>
      ))}
    </div>
  )
}
