import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ModalBurra } from "./components/ModalBurra";
import { Painel } from "./components/Painel";
import type { TeclaValor } from "./components/types";
import { TelaVotacao } from "./components/TelaVotacao";
import { Urna } from "./components/Urna";
import { ANOS, carregarEleicao } from "./votacao/dados";
import type { Eleicao } from "./votacao/types";
import { useVotacao } from "./votacao/useVotacao";

const LARGURA_URNA = 860;
const TEMPO_FIM_MS = 3000;
const NUMERO_PROIBIDO = "22";

/** Escala a urna para caber na tela sem quebrar o layout em pixels. */
function useEscala() {
  const calcular = () => Math.min(1, (window.innerWidth - 32) / LARGURA_URNA);
  const [escala, setEscala] = useState(calcular);

  useEffect(() => {
    const onResize = () => setEscala(calcular());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return escala;
}

const TECLAS_FISICAS: Record<string, TeclaValor> = {
  Enter: "confirma",
  Backspace: "corrige",
  Escape: "corrige",
  b: "branco",
  B: "branco",
};

function App() {
  const escala = useEscala();
  const ano = ANOS[0];
  const [eleicao, setEleicao] = useState<Eleicao | null>(null);
  const {
    estado,
    candidato,
    pressionar: pressionarUrna,
    reiniciar,
  } = useVotacao(eleicao?.candidatos ?? []);

  // Só aceita teclas quando os dados da eleição selecionada já estão carregados.
  const pronta = eleicao?.ano === ano;
  const [burra, setBurra] = useState(false);

  const pressionar = useCallback(
    (tecla: TeclaValor) => {
      if (!pronta || burra) return;
      // Voto no 22 não passa do CONFIRMA: abre o modal em vez de chegar ao FIM.
      if (
        tecla === "confirma" &&
        estado.etapa === "digitando" &&
        estado.numero === NUMERO_PROIBIDO
      ) {
        setBurra(true);
        return;
      }
      pressionarUrna(tecla);
    },
    [pronta, burra, estado, pressionarUrna],
  );

  const fecharModal = useCallback(() => {
    setBurra(false);
    reiniciar();
  }, [reiniciar]);

  useEffect(() => {
    let ativo = true;
    carregarEleicao(ano).then((e) => {
      if (!ativo) return;
      setEleicao(e);
      reiniciar();
    });
    return () => {
      ativo = false;
    };
  }, [ano, reiniciar]);

  // Depois do "FIM", a urna fica pronta para o próximo eleitor.
  useEffect(() => {
    if (estado.etapa !== "fim") return;
    const t = setTimeout(reiniciar, TEMPO_FIM_MS);
    return () => clearTimeout(t);
  }, [estado.etapa, reiniciar]);

  // O listener é registrado uma vez e sempre chama a versão mais recente de `pressionar`.
  const pressionarAtual = useRef(pressionar);
  useLayoutEffect(() => {
    pressionarAtual.current = pressionar;
  }, [pressionar]);

  useLayoutEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Com o modal aberto, o teclado fica com ele (Enter no botão, Esc para fechar).
      if (
        e.target instanceof HTMLSelectElement ||
        document.querySelector('[role="alertdialog"]')
      )
        return;
      const tecla = /^[0-9]$/.test(e.key)
        ? (e.key as TeclaValor)
        : TECLAS_FISICAS[e.key];
      if (tecla) {
        e.preventDefault();
        pressionarAtual.current(tecla);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-300 p-4">
      {/* Com o modal aberto, o resto da página fica inerte (sem foco nem clique). */}
      <div inert={burra} className="contents">
        <Painel ano={ano} />

        <div style={{ zoom: escala }}>
          <Urna
            onPress={pressionar}
            tela={
              eleicao && <TelaVotacao estado={estado} candidato={candidato} />
            }
          />
        </div>

        {eleicao && (
          <p className="text-center text-sm text-slate-600">
            {eleicao.candidatos.length} candidatos em {eleicao.ano} ·{" "}
            <a
              className="underline hover:text-slate-900"
              href={eleicao.fonte}
              target="_blank"
              rel="noreferrer"
            >
              fonte
            </a>{" "}
            · teclado: números, Enter (confirma), Backspace (corrige), B
            (branco)
          </p>
        )}

        {candidato?.fotoCredito && (
          <p
            className="-mt-4 text-center text-xs text-slate-500"
            data-testid="credito-foto"
          >
            Foto de {candidato.nome}:{" "}
            {candidato.fotoCredito.autor ?? "autor desconhecido"} ·{" "}
            <a
              className="underline hover:text-slate-800"
              href={candidato.fotoCredito.fonte}
              target="_blank"
              rel="noreferrer"
            >
              {candidato.fotoCredito.licenca}
            </a>{" "}
            · Wikimedia Commons
          </p>
        )}
      </div>

      {burra && <ModalBurra onFechar={fecharModal} />}
    </main>
  );
}

export default App;
