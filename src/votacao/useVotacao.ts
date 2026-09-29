import { useCallback, useRef, useState } from 'react'
import type { TeclaValor } from '../components/types'
import { somFim, somTecla } from './som'
import type { Candidato } from './types'

export const DIGITOS = 2

export type EstadoVoto =
  | { etapa: 'digitando'; numero: string }
  | { etapa: 'branco' }
  | { etapa: 'fim' }

export function useVotacao(candidatos: Candidato[], onVoto?: (voto: string) => void) {
  const [estado, setEstadoRender] = useState<EstadoVoto>({ etapa: 'digitando', numero: '' })
  // Guarda o estado mais recente para teclas pressionadas antes do próximo render.
  const atual = useRef(estado)
  const setEstado = useCallback((novo: EstadoVoto) => {
    atual.current = novo
    setEstadoRender(novo)
  }, [])

  const reiniciar = useCallback(() => setEstado({ etapa: 'digitando', numero: '' }), [setEstado])

  const pressionar = useCallback(
    (tecla: TeclaValor) => {
      const estado = atual.current
      if (estado.etapa === 'fim') return

      switch (tecla) {
        case 'corrige':
          somTecla()
          reiniciar()
          return
        case 'branco':
          if (estado.etapa === 'digitando' && estado.numero === '') {
            somTecla()
            setEstado({ etapa: 'branco' })
          }
          return
        case 'confirma': {
          const completo = estado.etapa === 'branco' || estado.numero.length === DIGITOS
          if (!completo) return
          somFim()
          onVoto?.(estado.etapa === 'branco' ? 'branco' : estado.numero)
          setEstado({ etapa: 'fim' })
          return
        }
        default:
          if (estado.etapa === 'digitando' && estado.numero.length < DIGITOS) {
            somTecla()
            setEstado({ etapa: 'digitando', numero: estado.numero + tecla })
          }
      }
    },
    [onVoto, reiniciar, setEstado],
  )

  const candidato =
    estado.etapa === 'digitando' && estado.numero.length === DIGITOS
      ? (candidatos.find((c) => c.numero === estado.numero) ?? null)
      : null

  return { estado, candidato, pressionar, reiniciar }
}
