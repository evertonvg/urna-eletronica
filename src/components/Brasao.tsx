/** Brasão estilizado (simplificado) das Armas Nacionais. */
export function Brasao({ className = '' }: { className?: string }) {
  const raios = Array.from({ length: 20 }, (_, i) => i * 18)

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <g fill="#8a8c8f">
        {raios.map((a) => (
          <polygon key={a} points="50,4 54,26 46,26" transform={`rotate(${a} 50 50)`} />
        ))}
      </g>
      <circle cx="50" cy="50" r="26" fill="#9a9c9f" stroke="#6d6f72" strokeWidth="2" />
      <circle cx="50" cy="50" r="17" fill="#b9bbbe" stroke="#6d6f72" strokeWidth="1.5" />
      <polygon
        points="50,36 53.5,46 64,46 55.5,52 58.8,62 50,56 41.2,62 44.5,52 36,46 46.5,46"
        fill="#6d6f72"
      />
      <path d="M22 80 Q50 96 78 80" fill="none" stroke="#6d6f72" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
