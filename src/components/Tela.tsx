import type { ReactNode } from 'react'

type Props = {
  children?: ReactNode
}

export function Tela({ children }: Props) {
  return (
    // Moldura da tela
    <div className="rounded-[3px] bg-gradient-to-b from-[#b7babd] to-[#d6d8db] p-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)]">
      {/* LCD */}
      <div
        data-testid="tela"
        className="relative h-[330px] w-[430px] overflow-hidden border border-[#8d9190] bg-urna-lcd font-mono text-urna-lcd-ink shadow-[inset_0_0_18px_rgba(0,0,0,0.18)]"
      >
        {children}
      </div>
    </div>
  )
}
