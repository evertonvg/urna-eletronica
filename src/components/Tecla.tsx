import type { ReactNode } from 'react'
import type { TeclaValor } from './types'

const base =
  'relative flex select-none items-center justify-center rounded-[5px] transition-[transform,box-shadow] duration-75 active:translate-y-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 cursor-pointer'

const variantes = {
  numero:
    'h-10 w-14 bg-gradient-to-b from-[#34353a] to-urna-key text-2xl font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_3px_0_#0c0c0d,0_5px_6px_rgba(0,0,0,0.55)] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_0_#0c0c0d,0_2px_3px_rgba(0,0,0,0.5)]',
  branco:
    'h-11 w-[4.75rem] bg-gradient-to-b from-white to-urna-branco text-[13px] text-neutral-500 shadow-[inset_0_-2px_0_rgba(0,0,0,0.08),0_3px_0_#9d9d9b,0_5px_6px_rgba(0,0,0,0.5)] active:shadow-[0_1px_0_#9d9d9b,0_2px_3px_rgba(0,0,0,0.5)]',
  corrige:
    'h-11 w-[4.75rem] bg-gradient-to-b from-[#f48a3a] to-urna-corrige text-[13px] text-neutral-900/70 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1),0_3px_0_#9c4610,0_5px_6px_rgba(0,0,0,0.5)] active:shadow-[0_1px_0_#9c4610,0_2px_3px_rgba(0,0,0,0.5)]',
  confirma:
    'h-14 w-[5.25rem] bg-gradient-to-b from-[#5cc585] to-urna-confirma text-[13px] text-neutral-900/70 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1),0_3px_0_#236b3f,0_5px_6px_rgba(0,0,0,0.5)] active:shadow-[0_1px_0_#236b3f,0_2px_3px_rgba(0,0,0,0.5)]',
}

type Props = {
  valor: TeclaValor
  variante: keyof typeof variantes
  onPress?: (valor: TeclaValor) => void
  children: ReactNode
}

export function Tecla({ valor, variante, onPress, children }: Props) {
  const ehAcao = variante !== 'numero'

  return (
    <button
      type="button"
      data-key={valor}
      aria-label={ehAcao ? valor : `tecla ${valor}`}
      onClick={() => onPress?.(valor)}
      className={`${base} ${variantes[variante]}`}
    >
      <span className={ehAcao ? 'flex flex-col items-center gap-1 uppercase tracking-tight' : ''}>
        {children}
        {ehAcao && <Braille />}
      </span>
    </button>
  )
}

/** Fileira de pontos em relevo, imitando o Braille das teclas de ação. */
function Braille() {
  return (
    <span
      aria-hidden
      className="block h-1 w-12 opacity-40 [background-image:radial-gradient(circle,currentColor_1px,transparent_1.3px)] [background-size:5px_4px]"
    />
  )
}
