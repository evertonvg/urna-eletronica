# Dados de candidatos

Os JSONs em `src/data/` são extraídos da Wikipédia em português, porque as APIs do TSE
(DivulgaCandContas e Dados Abertos) bloqueiam acesso automatizado.

- `presidente/2026.json`: eleição presidencial de 2026.

Para presidente, o número do candidato é o número do partido, então o número vem da sigla
(tabela `PARTIDOS` em `parse.py`).

## Atualizar

```bash
python3 scripts/candidatos/baixar.py      # baixa as páginas que faltam (use --forcar para rebaixar)
python3 scripts/candidatos/fotos_links.py # liga cada candidato ao seu artigo (fotos_artigos.json)
python3 scripts/candidatos/fotos_baixar.py # baixa as fotos para public/candidatos/ (fotos.json)
python3 scripts/candidatos/gerar.py       # gera os JSONs e imprime anomalias para revisão
```

- `jobs.json`: lista de páginas (UF, ano, título).
- `correcoes.json`: ajustes manuais aplicados depois da extração (`set`, `add`, `remove`).

## Fotos

A foto é a imagem principal do artigo do candidato na Wikipédia (Wikimedia Commons), salva como miniatura de
240px em `public/candidatos/<ano>/<numero>.<ext>`. Cada candidato recebe `foto` e `fotoCredito`
(autor, licença e página do arquivo); o crédito aparece abaixo da urna, como exigem as licenças CC BY.
Imagens de conteúdo restrito ou não livre são descartadas. Quem não tem foto aparece com uma silhueta.
