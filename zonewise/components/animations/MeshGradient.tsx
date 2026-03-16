const keyframes = `
@keyframes meshFloat1{0%{transform:translate(0,0) scale(1)}33%{transform:translate(50px,-35px) scale(1.08)}66%{transform:translate(-25px,15px) scale(.95)}100%{transform:translate(0,0) scale(1)}}
@keyframes meshFloat2{0%{transform:translate(0,0) scale(1)}33%{transform:translate(-40px,25px) scale(.92)}66%{transform:translate(30px,-40px) scale(1.1)}100%{transform:translate(0,0) scale(1)}}
`

export default function MeshGradient({ intensity = 'subtle' }: { intensity?: 'subtle' | 'medium' | 'bold' }) {
  const op = { subtle: 0.25, medium: 0.45, bold: 0.65 }[intensity]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{keyframes}</style>
      <div className="absolute rounded-full blur-[120px]" style={{ width: '45%', height: '45%', top: '5%', left: '15%', background: `radial-gradient(circle, rgba(30,58,95,${op}) 0%, transparent 70%)`, animation: 'meshFloat1 22s ease-in-out infinite' }} />
      <div className="absolute rounded-full blur-[100px]" style={{ width: '35%', height: '35%', bottom: '15%', right: '10%', background: `radial-gradient(circle, rgba(245,158,11,${op * 0.4}) 0%, transparent 70%)`, animation: 'meshFloat2 28s ease-in-out infinite' }} />
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(to right, rgba(30,58,95,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,58,95,1) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
    </div>
  )
}
