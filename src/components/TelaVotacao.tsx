import type { Candidato } from '../votacao/types'
import { DIGITOS, type EstadoVoto } from '../votacao/useVotacao'

type Props = {
  estado: EstadoVoto
  candidato: Candidato | null
}

export function TelaVotacao({ estado, candidato }: Props) {
  if (estado.etapa === 'fim') {
    return (
      <div className="flex h-full items-center justify-center font-sans text-[110px] font-bold tracking-widest">
        FIM
      </div>
    )
  }

  const numero = estado.etapa === 'digitando' ? estado.numero : ''
  const completo = numero.length === DIGITOS
  const nulo = completo && !candidato
  const mostrarRodape = estado.etapa === 'branco' || completo

  return (
    <div className="flex h-full flex-col font-sans text-[15px]">
      <div className="flex flex-1 gap-3 p-3">
        <div className="flex flex-1 flex-col">
          <p className="text-sm">SEU VOTO PARA</p>
          <p className="mt-1 mb-4 text-center text-2xl font-bold">PRESIDENTE</p>

          {estado.etapa === 'branco' ? (
            <p className="mt-10 text-center text-3xl font-bold">VOTO EM BRANCO</p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span>Número:</span>
                {Array.from({ length: DIGITOS }, (_, i) => (
                  <span
                    key={i}
                    data-testid="digito"
                    className={`flex h-10 w-8 items-center justify-center border border-urna-lcd-ink text-2xl font-bold ${
                      i === numero.length ? 'animate-pulse bg-urna-lcd-ink/15' : ''
                    }`}
                  >
                    {numero[i] ?? ''}
                  </span>
                ))}
              </div>

              {candidato && (
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                  <dt>Nome:</dt>
                  <dd className="font-bold uppercase">{candidato.nome}</dd>
                  <dt>Partido:</dt>
                  <dd className="font-bold">{candidato.partido}</dd>
                  {candidato.vice && (
                    <>
                      <dt>Vice-Presidente:</dt>
                      <dd className="uppercase">{candidato.vice}</dd>
                    </>
                  )}
                </dl>
              )}

              {nulo && (
                <div className="mt-4">
                  <p className="font-bold">NÚMERO ERRADO</p>
                  <p className="mt-6 text-center text-3xl font-bold">VOTO NULO</p>
                </div>
              )}
            </>
          )}
        </div>

        {candidato && (
          <div className="flex flex-col items-center gap-2">
            <Foto
              rotulo="Presidente"
              // BASE_URL mantém as fotos funcionando quando o site está num subcaminho (GitHub Pages).
              src={candidato.foto && import.meta.env.BASE_URL + candidato.foto}
              alt={candidato.nome}
              grande
            />
            {candidato.vice && <Foto rotulo="Vice" />}
          </div>
        )}
      </div>

      {mostrarRodape && (
        <div className="border-t border-urna-lcd-ink px-3 py-2 text-[13px] leading-snug">
          <p>Aperte a tecla:</p>
          <p className="pl-4">
            <b>CONFIRMA</b> para CONFIRMAR este voto
          </p>
          <p className="pl-4">
            <b>CORRIGE</b> para REINICIAR este voto
          </p>
        </div>
      )}
    </div>
  )
}

type FotoProps = { rotulo: string; src?: string; alt?: string; grande?: boolean }

/** Foto do candidato, ou uma silhueta quando não há foto. */
function Foto({ rotulo, src, alt = '', grande = false }: FotoProps) {
  const tamanho = grande ? 'h-24 w-20' : 'h-16 w-14'
  return (
    <figure className="flex flex-col items-center">
      {src ? (
        <img
          src={src}
          alt={alt}
          data-testid="foto-candidato"
          className={`border border-urna-lcd-ink bg-[#b3b8b5] object-cover object-top ${tamanho}`}
        />
      ) : (
      <svg
        viewBox="0 0 60 72"
        className={`border border-urna-lcd-ink bg-[#b3b8b5] ${tamanho}`}
        aria-hidden
      >
        <circle cx="30" cy="26" r="13" fill="#7d837f" />
        <path d="M6 72 Q8 44 30 44 Q52 44 54 72Z" fill="#7d837f" />
      </svg>
      )}
      <figcaption className="text-[11px]">{rotulo}</figcaption>
    </figure>
  )
}
