import { Brasao } from './Brasao'
import { Tela } from './Tela'
import { Teclado } from './Teclado'
import type { TeclaValor } from './types'
import type { ReactNode } from 'react'

type Props = {
  tela?: ReactNode
  onPress?: (valor: TeclaValor) => void
}

export function Urna({ tela, onPress }: Props) {
  return (
    <div className="relative w-[860px] pb-3">
      {/* Face superior inclinada */}
      <div className="h-12 border-b border-white/70 bg-gradient-to-b from-[#f3f4f5] to-[#dcdee0] [clip-path:polygon(3%_0,97%_0,100%_100%,0_100%)]" />

      {/* Face frontal */}
      <div className="flex items-start gap-12 rounded-b-lg bg-gradient-to-b from-urna-case to-urna-case-dark px-12 pt-6 pb-8 shadow-[0_18px_30px_-12px_rgba(0,0,0,0.45)]">
        <Tela>{tela}</Tela>

        <div className="flex w-[280px] flex-col">
          {/* Placa da Justiça Eleitoral */}
          <div className="flex h-[72px] items-center justify-between bg-gradient-to-b from-[#f4f4f5] to-[#e2e3e5] px-3">
            <Brasao className="h-14 w-14" />
            <p className="text-right text-xl leading-tight font-bold tracking-wide text-neutral-700">
              JUSTIÇA
              <br />
              ELEITORAL
            </p>
          </div>
          <Teclado onPress={onPress} />
        </div>
      </div>

      {/* Pezinhos / frisos da base */}
      <div className="flex justify-between px-14">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="h-2 w-1 rounded-b-sm bg-[#8e9093]" />
        ))}
      </div>
    </div>
  )
}
