import { useRef, useState, useEffect } from 'react'

export default function AnimatedCounter({ end, suffix = '', decimals = 0 }: { end: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)
  const [started, setStarted] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect() } }, { threshold: 0.5 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!started) return
    let t0: number | null = null
    const run = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / 1400, 1)
      setVal((1 - Math.pow(1 - p, 3)) * end)
      if (p < 1) requestAnimationFrame(run)
    }
    requestAnimationFrame(run)
  }, [started, end])
  return <span ref={ref}>{decimals ? val.toFixed(decimals) : Math.floor(val).toLocaleString()}{suffix}</span>
}
