type Props = {
  ano: number
}

export function Painel({ ano }: Props) {
  return (
    <div className="rounded-xl bg-white/70 px-5 py-3 text-center shadow-sm ring-1 ring-slate-200 backdrop-blur">
      <span className="text-sm font-semibold text-slate-700">Eleições {ano} · Presidente da República</span>
    </div>
  )
}
