# Urna Eletrônica

Simulador da urna eletrônica brasileira para a eleição presidencial de 2026, feito com React, Vite e Tailwind.

- Digite o número do candidato para ver nome, partido, vice e foto; CONFIRMA, CORRIGE e BRANCO funcionam como na urna.
- Teclado físico: números, Enter (confirma), Backspace (corrige), B (branco).

## Rodando

```bash
nvm use
npm install
npm run dev        # http://localhost:5173
npm run test:e2e   # testes com Playwright (usa o Google Chrome instalado)
```

## Dados

Os candidatos ficam em `src/data/presidente/2026.json` e as fotos em `public/candidatos/2026/`,
extraídos da Wikipédia e do Wikimedia Commons (créditos exibidos abaixo da urna).
Veja [scripts/candidatos](scripts/candidatos/README.md) para regenerar.
