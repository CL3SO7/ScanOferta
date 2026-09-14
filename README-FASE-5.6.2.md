# Oferta Radar 5.6.2

Correções:
- Aba `Analisar Oferta` agora usa a extensão primeiro, em vez de chamar a Vercel diretamente.
- Se uma requisição local receber 403, a extensão abre a landing em uma aba temporária, espera o carregamento real e analisa o DOM renderizado.
- Depois fecha automaticamente a aba temporária.
- O backend Vercel virou o terceiro fallback.
- O resultado informa se foi analisado por `Extensão local`, `Página aberta no navegador` ou `Servidor`.
- Mantém o acesso por Library ID na Meta.

Atualização necessária:
1. Atualize GitHub/Vercel.
2. Recarregue a pasta `meta-captor-extension` no Chrome.
3. Confirme versão 5.6.2.
