# Oferta Radar — Fase 5: Meta Ads conectado

## O que mudou
A tela principal agora é **Caçar Ofertas**.

A integração funciona com uma extensão Chrome local:
1. Abra `chrome://extensions`
2. Ative `Modo do desenvolvedor`
3. Clique em `Carregar sem compactação`
4. Selecione a pasta `meta-captor-extension`
5. Atualize o Oferta Radar
6. No Radar, pesquise um nicho e clique `Buscar na Meta`
7. Na Biblioteca, role para carregar anúncios e clique `🎯 Capturar anúncios visíveis`
8. Volte ao Radar e clique `Sincronizar`

## O Radar passa a mostrar
- anúncios capturados
- anunciantes/grupos
- número de anúncios por grupo
- criativos encontrados
- longevidade aproximada quando a data é legível
- destinos/landing pages encontrados
- score de evidência
- atalhos para Meta e landing

## Por que extensão?
A API oficial da Meta Ad Library não disponibiliza via API a mineração geral de anúncios comerciais entregues apenas no Brasil. A extensão lê apenas o conteúdo que a própria Biblioteca oficial já exibiu no seu navegador.

## Observação
A estrutura do HTML da Meta pode mudar; o capturador usa heurísticas de texto (Library ID / Identificação da biblioteca) para ser menos dependente de classes CSS internas.
