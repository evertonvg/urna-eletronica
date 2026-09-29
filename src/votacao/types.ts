export type Candidato = {
  numero: string
  nome: string
  partido: string
  vice: string | null
  /** Caminho relativo a public/, ex.: candidatos/2026/13.jpg */
  foto?: string
  fotoCredito?: { autor: string | null; licenca: string | null; fonte: string }
}

export type Eleicao = {
  ano: number
  fonte: string
  candidatos: Candidato[]
}
