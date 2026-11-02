# Regras do design system — grade, espaçamento, cor e fundo (rascunho v1, 02/11/2026)

Motivo: o estúdio v2 tinha coisas "jogadas". Daqui pra frente nenhuma peça posiciona elemento solto: tudo se prende a uma linha da grade e a espaçamentos da escala.

## 1. Unidade e escala de espaçamento
- Medidas em pixels do quadro final (1920×1080 ou 1080×1920).
- **Unidade base = 8 px.** Todo espaçamento é múltiplo dela.
- Escala permitida: **8 · 16 · 24 · 32 · 48 · 64 · 96 · 128**. Nada fora dela.
- Espaços internos de caixa (chapéu, tarja): 12 × 20 px fixos (exceção registrada, igual em todas as peças).

## 2. Margens e área de texto
| Formato | Margem lateral | Margem topo | Margem base | Observação |
|---|---|---|---|---|
| 16x9 | 128 | 96 | 96 | área de texto 1664 × 888 |
| 9x16 | 96 esq. / 192 dir. | 288 | 672 | caixa comum TikTok/Reels/Shorts (área de texto 792 × 960) |
| 4:5 (feed) | 80 | 80 | 80 | |
- **Texto nunca sai da área de texto.** Foto e fundo podem sangrar.
- No 9x16 a coluna é deslocada para a esquerda por causa dos botões da direita; textos **centralizados** usam o eixo da área de texto (x = 492), não o centro da tela (540).

## 3. Alinhamento
- Todo bloco se prende a **uma âncora**: canto inferior-esquerdo da área, centro da área, ou canto superior-esquerdo. Não existe posição livre.
- Elementos de um bloco ficam **empilhados**, alinhados pela mesma borda (esquerda) ou pelo mesmo eixo (centro).
- Chapéu → manchete: 24 px. Manchete → linha de apoio: 32 px. Bloco de texto → crédito/fonte: 48 px.
- Crédito vertical: colado na margem direita da área (16x9: x = 1792; 9x16: x = 888), base alinhada com a base do bloco de texto.

## 4. Tipografia (tamanhos em px no quadro final)
| Papel | Fonte | 16x9 | 9x16 | Entrelinha | Regra |
|---|---|---|---|---|---|
| Manchete principal (centralizada, caixa alta) | Aktiv Cd XBold | 112 | 104 | 0,95 | máx. 3 linhas, ~18 caracteres/linha |
| Manchete de apoio (caixa normal) | Aktiv Cd XBold | 80 | 72 | 1,0 | máx. 3 linhas |
| Número / palavra gigante | TipoNinja | 280 | 240 | 0,9 | 1 por quadro |
| Chapéu / rótulo | Microgramma Bold Ext | 28 | 28 | 1 | caixa alta, ≤ 28 caracteres |
| Texto corrido / lista | Manrope SemiBold | 40 | 40 | 1,3 | máx. 4 linhas |
| Legenda | Manrope ExtraBold | 56 | 60 | 1,2 | 2–5 palavras |
| Crédito | Manrope SemiBold | 18 | 20 | 1 | |

## 5. Hierarquia de cor (para todo mundo executar igual)
- **Base fixa**: preto `#000`, branco `#FFF`, cinza de apoio `#9A9A9A`. É 90% de qualquer quadro.
- **Cor de destaque da cobertura** (uma só por vídeo, escolhida no começo): amarelo `#FADF4B` (padrão), verde `#75FB4C` ou magenta `#EA33F7`.
  - Serve para **uma coisa por quadro**: o grifo, o número, a palavra-chave ou a barra. Nunca para texto corrido, nunca para fundo de manchete longa.
  - Ocupa no máximo ~10% da área do quadro. **Nunca vira fundo de tela inteira** (o blocão amarelo foi testado e reprovado em 02/11).
  - Sobre a cor de destaque, o texto é sempre **preto**.
- **Cores com significado (nunca usadas como destaque)**:
  - Vermelho `#E8202A` = AO VIVO, alerta, FALSO.
  - Verde de checagem `#2BD35A` = VERDADEIRO.
  - Cores de marca de terceiros (WhatsApp, Telegram) só dentro do próprio ícone.
- Contraste mínimo 4,5:1 entre texto e o que estiver atrás.

## 6. Fundo atrás do texto (a sombra do Canva não basta no YouTube)
| Caso | Tratamento |
|---|---|
| Texto embaixo, foto com área escura natural | degradê de baixo (0 → 85% preto em 55% da altura) |
| **Texto centralizado** (manchete principal) | **véu preto 45–60%** sobre a foto inteira |
| Foto muito movimentada / colorida | **desfoque 24 px + véu 35%** |
| Peças de texto puro | preto com **grão** (textura) ou cor de destaque cheia |
- **Saída suave**: o texto sai primeiro; o véu/desfoque some em 300–400 ms depois. Nunca corte seco do fundo.

## 6b. Texto nunca solto sobre a imagem (02/11)
- Texto branco direto na foto dá errado com frequência. Toda peça sobre imagem usa **caixa** (branca ou preta, que mede o texto) **ou** véu/desfoque de tela inteira. Degradê sozinho só com texto grande e foto conferida.
- Tarja de nome: evolução da atual do .mogrt — nome em caixa branca (Aktiv, preto) + cargo em caixa preta (Microgramma, branco), empilhadas e alinhadas à esquerda. Barra lateral colorida ("template batido") reprovada.

## 7. Manchetes de outros veículos
- Banco de logos padronizado: `marca/logos-veiculos/` (14 veículos, tirados do .mogrt MANCHETE 01).
  - Falta padronizar: recortar sobras, versão branca (monocromática) e altura óptica igual.
- Campo "logo do veículo": escolher do banco **ou** subir um PNG → o sistema limpa o fundo e aplica a "fita" (faixa) atrás, como no .mogrt.
