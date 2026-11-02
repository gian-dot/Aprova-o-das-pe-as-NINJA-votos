# Aprovação das peças NINJA

> **Página temporária**, só para os primeiros feedbacks. O design system principal da Mídia NINJA agora é o **NINJA Design System, do Thiago**, num repositório próprio. As mudanças de design são feitas lá, e não aqui.

Página aberta onde a equipe da Mídia NINJA vê, em loop, cada peça gráfica dos vídeos (manchete, tarja, crédito, linha do tempo, gráficos…) e decide se ela está **aprovada**, se **precisa de ajuste** ou se tem que ser **refeita**.

**Página:** https://gian-dot.github.io/Aprova-o-das-pe-as-NINJA-votos/

## Como votar

1. Abra a página e escreva seu nome no alto (uma vez só; o navegador lembra).
2. Em cada peça, troque as variações para comparar e clique em **Aprovar**, **Pedir ajuste** ou **Refazer**. Clicar de novo no mesmo botão tira o seu voto.
3. Escreva o porquê no campo de comentário da peça. Todo mundo vê.

Vale o último voto de cada pessoa. O selo da peça mostra a decisão com mais votos; no empate, fica a mais cautelosa (refazer > ajustar > aprovar).

Os votos e comentários ficam numa Planilha Google do Gian (aba `votos`). Não precisa de login: qualquer pessoa com o link vota, então use seu nome de verdade.

## O que tem aqui

| Pasta ou arquivo | O que é |
|---|---|
| `index.html` | a página (gerada; não editar à mão) |
| `catalogo.json` | a lista das peças: o `id` usado nos votos, a seção, a ficha e as variações |
| `design-system/` | cópia do design system da Máquina de Vídeos: tokens, fichas das peças, regras e os componentes das peças que já estão no app |
| `urna/votos.gs` | o código da planilha que recebe os votos (Google Apps Script) |
| `fontes/`, `logos/`, `quadros/`, `veiculos/` | fontes, logos da NINJA, quadros de referência e logos de veículos usados na página |
| `AGENTS.md` | o guia para agentes de IA (o do Thiago, o Claude) lerem e proporem mudanças do jeito certo |

## Como uma mudança chega aqui

O design system de verdade mora no repositório da Máquina de Vídeos (privado). Esta página é gerada a partir dele e republicada a cada rodada. Proposta de mudança entra por **Pull Request** neste repositório, do jeito explicado no `AGENTS.md`. O Gian aprova, a mudança vai para a Máquina e a página é gerada de novo.

## Licenças

As fontes Aktiv Grotesk (versão Trial) e Microgramma são comerciais. Os quadros de referência e os logos de outros veículos são de terceiros. Estão aqui só para a revisão interna do design.
