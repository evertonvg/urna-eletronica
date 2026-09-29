import { Tecla } from './Tecla'
import type { Digito, TeclaValor } from './types'

const linhas: Digito[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
]

type Props = {
  onPress?: (valor: TeclaValor) => void
}

export function Teclado({ onPress }: Props) {
  return (
    <div className="flex flex-col items-center rounded-sm bg-urna-panel px-4 pt-6 pb-5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
      <div className="grid grid-cols-3 gap-x-5 gap-y-4">
        {linhas.flat().map((d) => (
          <Tecla key={d} valor={d} variante="numero" onPress={onPress}>
            {d}
          </Tecla>
        ))}
        <div className="col-start-2">
          <Tecla valor="0" variante="numero" onPress={onPress}>
            0
          </Tecla>
        </div>
      </div>

      <div className="mt-5 flex items-end gap-2.5">
        <Tecla valor="branco" variante="branco" onPress={onPress}>
          Branco
        </Tecla>
        <Tecla valor="corrige" variante="corrige" onPress={onPress}>
          Corrige
        </Tecla>
        <Tecla valor="confirma" variante="confirma" onPress={onPress}>
          Confirma
        </Tecla>
      </div>
    </div>
  )
}
