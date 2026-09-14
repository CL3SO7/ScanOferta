# Oferta Radar 5.6.1 — correção 403 + anúncio exato

## Corrigido
1. `Investigar` agora tenta analisar a landing pelo navegador do próprio usuário através da extensão, antes de usar a Vercel.
   Isso contorna muitos bloqueios 403 contra IPs/datacenters da Vercel.
2. Se a análise local também falhar, o sistema usa `/api/analyze` como fallback e mostra os dois erros.
3. `Ver na Meta` usa agora o `Library ID` capturado (`/ads/library/?id=...`) em vez de pesquisar pelo nome do anunciante.
4. O Library ID é exibido no card para conferência.

## Atualização necessária
Esta correção altera dashboard E extensão.
- envie os arquivos do projeto para GitHub/Vercel;
- recarregue a pasta `meta-captor-extension` em chrome://extensions;
- confirme que o popup mostra 5.6.1.
