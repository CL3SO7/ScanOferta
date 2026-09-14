# Oferta Radar — Minerador V1 / Fase 2

Dashboard pessoal em React + Tailwind para descobrir páginas e funis através do urlscan.io e investigar os domínios encontrados na Meta Ads Library.

## O que entrou na Fase 2

- Minerador guiado por tipo de funil: Radar amplo, WhatsApp, Checkout, VSL/Vídeo e Pixel/Tracking.
- Período: 24h, 3, 7, 14, 30 ou 90 dias.
- Pista/palavra opcional pesquisada em URL/domínio indexados pelo urlscan.
- Presets rápidos Brasil.
- Score técnico + bônus de recorrência dentro da coleta atual.
- Filtros por score e sinais detectados.
- Ordenação por score, recorrência, data e domínio.
- Ficha lateral de investigação da oferta.
- Pesquisa na Meta Ads Library por domínio e por título.
- Atalhos para oferta e resultado do urlscan.
- Favoritos persistidos no localStorage.
- API Key do urlscan persistida somente no navegador.

## Importante

O número de recorrências exibido é quantas vezes um domínio apareceu nos resultados da consulta do urlscan. Ele NÃO representa quantidade de anúncios ativos na Meta. A camada real de coleta/monitoramento da Meta deve ser tratada separadamente para não inventar métricas.

A busca por palavra nesta versão usa campos públicos de URL/domínio do urlscan. Busca pelo texto visível da página (`text.content`) é recurso de planos superiores do urlscan.

## Vercel

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## Desenvolvimento local

```bash
npm install
npm run dev
```
