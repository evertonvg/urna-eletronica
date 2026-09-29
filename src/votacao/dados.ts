import type { Eleicao } from './types'

const arquivos = import.meta.glob<Eleicao>('../data/presidente/*.json', { import: 'default' })

const anoDoCaminho = (caminho: string) => Number(caminho.match(/(\d{4})\.json$/)![1])

/** Anos com dados, do mais recente para o mais antigo. */
export const ANOS = Object.keys(arquivos)
  .map(anoDoCaminho)
  .sort((a, b) => b - a)

export async function carregarEleicao(ano: number): Promise<Eleicao> {
  const carregar = arquivos[`../data/presidente/${ano}.json`]
  if (!carregar) throw new Error(`Sem dados para a eleição de ${ano}`)
  return carregar()
}
