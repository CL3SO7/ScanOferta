# Oferta Radar — Fase 6.1

## Correção do Motor de Descoberta
A 6.0 era silenciosa demais e o corte era alto. Uma sessão podia analisar 100+ anúncios e parecer que não fez nada.

Na 6.1:
- extensão mostra `analisados`, `candidatos`, `auto enviados` e `melhor score`;
- deixa explícito que no modo automático NÃO precisa marcar nem clicar Enviar;
- candidatos 48+ aparecem em `Descoberta`;
- 65+ são enviados automaticamente para `Caixa de Entrada`;
- se uma sessão inteira for fraca, os Top 15 observados ainda ficam em `Descoberta` para diagnóstico;
- salva durante a sessão e também ao parar;
- mantém deduplicação.

## Oportunidades virou Laboratório de Busca
Agora o usuário digita um nicho (ex.: inglês, concurso, beleza, culinária) e recebe até 20 pesquisas orientadas a:
- nicho;
- infoproduto;
- preço;
- conversão/garantia.

Cada sugestão abre direto na Meta e no Google Trends.

Dashboard e extensão precisam ser atualizados.
