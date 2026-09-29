import audioFim from '../assets/confirma-urna.mp3'

let ctx: AudioContext | null = null

function tocar(notas: { freq: number; inicio: number; duracao: number }[]) {
  ctx ??= new AudioContext()
  const agora = ctx.currentTime
  for (const { freq, inicio, duracao } of notas) {
    const osc = ctx.createOscillator()
    const ganho = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = freq
    ganho.gain.value = 0.06
    osc.connect(ganho).connect(ctx.destination)
    osc.start(agora + inicio)
    osc.stop(agora + inicio + duracao)
  }
}

/** Bipe curto de tecla. */
export const somTecla = () => tocar([{ freq: 1100, inicio: 0, duracao: 0.07 }])

const fim = new Audio(audioFim)

/** Som de fim de votação (áudio gravado da urna). */
export const somFim = () => {
  fim.currentTime = 0
  void fim.play().catch(() => {})
}
