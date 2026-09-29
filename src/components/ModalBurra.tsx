import { useEffect, useRef } from 'react'

type Props = {
  onFechar: () => void
}

export function ModalBurra({ onFechar }: Props) {
  const botao = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    botao.current?.focus()
    // Enter/Esc fecham mesmo se o foco saiu do botão.
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === 'Enter') && e.target !== botao.current) {
        e.preventDefault()
        onFechar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onFechar])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      // Clicar no fundo não tira o foco do botão.
      onMouseDown={(e) => e.target === e.currentTarget && e.preventDefault()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-burra-titulo"
        aria-describedby="modal-burra-texto"
        className="w-full max-w-sm animate-[tremer_0.4s_ease-in-out] rounded-2xl bg-white p-6 text-center shadow-2xl"
      >
        <p aria-hidden className="text-6xl">🫏</p>
        <h2 id="modal-burra-titulo" className="mt-3 text-3xl font-extrabold text-red-600">
          Que pessoa burra!
        </h2>
        <p id="modal-burra-texto" className="mt-2 text-slate-600">
          Voto no 22 não será confirmado. Pense melhor e vote de novo.
        </p>
        <button
          ref={botao}
          type="button"
          onClick={onFechar}
          onKeyDown={(e) => e.key === 'Escape' && onFechar()}
          className="mt-6 w-full rounded-lg bg-urna-corrige px-4 py-2.5 font-semibold text-white shadow hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          Corrigir voto
        </button>
      </div>
    </div>
  )
}
