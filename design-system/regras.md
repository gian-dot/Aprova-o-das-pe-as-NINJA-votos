# Regras visuais da Máquina (v2, 02/11/2026)

**A base é o NINJA Design System do Thiago**, copiado numa versão fixa em `ninja/` (versão em `ninja.versao.json`). Comece por `ninja/LEIA-PRIMEIRO.md`, `ninja/GUIA-AGENTES.md` e `ninja/fundamentos.json`. Quando esta página e o design system do Thiago discordam, vale o do Thiago.

- Não edite `ninja/` à mão. Para trazer outra versão: `npm run design-system:atualizar`.
- Nunca altere o repositório do Thiago. Mudanças que a Máquina precisa viram proposta em `docs/propostas-design-system/`.
- Ordem: fundamentos da marca → perfil da mídia → template → camada da Máquina (`tokens.json`), juntados por `fundamentos.js`.

## O que vem do Thiago (não repetir aqui nem no código)

- **Cores**: preto, branco e os destaques amarelo, rosa, verde-limão e ciano. Uma cor de destaque por vídeo, em um elemento por quadro, com texto preto por cima.
- **Fontes**: TipoNinja (chamada, chapéu, número gigante: caixa alta, sem alternativos nem ligaturas) e Manrope Medium (apoio, lead, cargo, crédito, texto corrido). Aktiv, Microgramma e os outros pesos da Manrope continuam em `marca/fontes/`, mas nenhuma peça usa.
- **Chapéu**: caixa branca, texto preto em TipoNinja, padding 15 × 9, espaçamento 0,02.
- **Espaços**: chapéu → chamada 20 px; chamada → lead 20 px.
- **Áreas**: 9x16 = perfil `reels` (área segura y 240–1680, margens laterais 70). 16x9 = perfil `thumbnail_youtube` (margem 60), provisório até o Thiago aprovar um perfil de vídeo.
- **Chamada**: tamanho variável conforme o texto e a área. Preferir 4 linhas; se não couber, reduzir até ~15%; depois tentar 5 linhas. Nunca mudar o texto para caber.
- **Pontuação**: sem ponto final no fim dos blocos.
- **Nomes**: chapéu, chamada, lead, crédito e assinatura são elementos separados. Logo é recurso; bug é aplicação.

## O que é da Máquina (vídeo), em `tokens.json`

- **Cores com significado** (proposta ao Thiago): vermelho `ao_vivo` = ao vivo, falso, alerta; verde `verdadeiro` = checagem verdadeira. Nunca usadas como destaque.
- **Fundo atrás do texto**: texto nunca solto sobre a imagem. Caixa que mede o texto, véu preto, desfoque + véu, ou degradê só com texto grande e foto conferida. Quando o fundo é escurecido na tela inteira, o conteúdo pode ocupar o centro.
- **Motion** (proposta ao Thiago): entrada por máscara ou varredura, linhas escalonadas, ênfase depois de o texto parar, saída espelhada e mais rápida, fundo sai por último. Toda peça tem entrada e saída. Os tempos estão em `tokens.json` → `motion`.
- **Modular**: cada peça faz uma coisa (a chamada não traz crédito nem logo). Cada elemento tem ajuste de posição próprio.
- **9x16**: por padrão, no centro da área segura.
- **Durações e formato de saída** de cada tipo de peça.
