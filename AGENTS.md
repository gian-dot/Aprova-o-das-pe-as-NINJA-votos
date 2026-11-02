# Guia para agentes de IA

> **Aviso (02/11/2026): este repositório é temporário.** Ele serve só para colher os primeiros votos e comentários da equipe. O design system principal da Mídia NINJA passa a ser o **NINJA Design System, do Thiago**, num repositório próprio. A Máquina de Vídeos e os outros apps vão se adaptar a ele. **Não proponha mudanças de design aqui:** faça no repositório do Thiago. Use este repositório só para ler os votos e os comentários (veja "Como ler os votos") e para entender as peças. O resto deste guia descreve o fluxo antigo e fica como referência.

Leia este arquivo antes de mexer em qualquer coisa aqui. Ele vale para qualquer agente (o do Thiago, o Codex, o Claude).

## O que é este repositório

É a vitrine pública do design system das peças gráficas da Mídia NINJA. A equipe vê cada peça em loop na página (`index.html`) e vota. **Não é a fonte da verdade:** o design system de verdade mora no repositório privado da Máquina de Vídeos, na pasta `design-system/`, e é copiado para cá a cada publicação. O app da Máquina usa esses mesmos arquivos para fazer o preview e exportar as peças com HyperFrames.

## Onde está cada coisa

| Caminho | Pode editar? | O que é |
|---|---|---|
| `design-system/tokens.json` | sim, por PR | **todo** valor visual: quadro, área de texto e margens por formato, escala de espaço, cores (destaques amarelo/verde/magenta), fontes, papéis de texto (tamanho, entrelinha, respiro), tratamentos de fundo, tempos de animação, formato de saída de cada peça |
| `design-system/pecas.json` | sim, por PR | as fichas das 27 peças: variáveis que a editora muda, tipos, limites de linhas e caracteres, opções, padrões, duração. O campo `como_ler` explica o formato |
| `design-system/regras.md` | sim, por PR | regras escritas: grade e espaçamento, margens, alinhamento, tipografia, hierarquia de cor, fundo atrás do texto, texto nunca solto sobre imagem, manchetes de outros veículos |
| `design-system/pecas/<id>.js` | sim, por PR | o componente de uma peça que já está no app (hoje `manchete_central`, `tarja_nome`, `credito`) |
| `design-system/base.js`, `composicao.js`, `limites.js` | só com motivo forte | ajudantes, a montagem do documento HyperFrames e a conta de limites. O app depende deles |
| `catalogo.json` | não (gerado) | as 29 entradas da página: `id` (usado nos votos), nome, seção, situação, `ficha` (id em `pecas.json`), se está `no_app`, variações |
| `index.html`, `fontes/`, `logos/`, `quadros/`, `veiculos/` | não (gerados) | a página e o que ela usa. São reescritos a cada publicação |
| `urna/votos.gs` | não | o código da planilha que recebe os votos |

As 26 peças que ainda não estão no app existem só como desenho do estúdio v4: estão dentro do `index.html`, na constante `P` (cada item é `[nome, situação, seção, descrição, variáveis, referências, lição, variações, animada]`, e cada variação é uma função `f => html` com `f` = `"h"` (16x9) ou `"v"` (9x16)). Use como referência visual; a peça definitiva nasce como componente em `design-system/pecas/`.

## Como ler os votos

A página manda os votos para um App da Web do Google Apps Script. O endereço está no `index.html`, na constante `PUBLICO.api`. Um `GET` nesse endereço devolve:

```json
{ "votos": [ { "em": "2026-11-02T15:32:47.000Z", "peca": "tarja-de-nome-e-cargo", "nome": "Ana", "decisao": "ajustar", "comentario": "fio mais grosso" } ] }
```

- `peca` é o `id` do `catalogo.json`.
- `decisao`: `aprovada`, `ajustar`, `refazer`, `nenhuma` (a pessoa tirou o voto) ou vazio (linha só de comentário).
- Vale o **último** voto de cada pessoa (nome comparado sem diferença de maiúsculas). A decisão da peça é a mais votada; no empate, a mais cautelosa (refazer > ajustar > aprovada).
- Os comentários são o motivo do voto: leia todos da peça antes de propor mudança.
- **Agente só lê.** Nunca envie voto nem comentário (POST) em nome de alguém.

## Como propor uma mudança

1. Comece pelas peças com mais pedidos de `ajustar` ou `refazer` e leia os comentários delas.
2. Mude o arquivo certo, em vez de espalhar valores:
   - medida, cor, fonte, tempo → `design-system/tokens.json` (o componente lê de lá; não escreva número solto no componente quando ele for um valor do sistema);
   - variável nova, limite, opção, duração → `design-system/pecas.json`;
   - regra de uso → `design-system/regras.md`;
   - comportamento de uma peça do app → `design-system/pecas/<id>.js`.
3. Abra um **Pull Request** neste repositório. Na descrição, diga quais peças mudam, quais votos ou comentários a mudança responde e o que muda no 16x9 e no 9x16.
4. Para uma peça nova ou uma ideia que ainda não cabe nos arquivos, crie `propostas/<id-da-peça>.md` com a ideia, as medidas em px no quadro final (1920×1080 ou 1080×1920) e as referências.

Depois que o Gian aprova o PR, a mudança é levada para a Máquina de Vídeos e a página é gerada de novo. **Um PR aceito aqui que ainda não foi para a Máquina é apagado na próxima publicação**, porque a cópia daqui é sobrescrita. Por isso não faça mudanças fora de PR.

## Contrato de um componente (`design-system/pecas/<id>.js`)

```js
export const id = 'tarja_nome';            // o mesmo id da ficha em pecas.json
export function montar({ valores, comuns, formato, tokens, recursos, duracao, destaque }) {
  return { fundo, html, css, animacoes };  // fundo e html são strings; css é CSS extra
}
```

- `valores`: o que a editora preencheu, com as chaves das variáveis da ficha. `formato`: `'16x9'` ou `'9x16'`. `destaque`: a cor de destaque do vídeo, já em hex. `recursos.midia`: a foto ou o vídeo de fundo (`{ url, tipo }`) ou `null`.
- `animacoes`: lista de `{ alvo, de?, para, em, duracao, ease }`. Vira uma timeline GSAP pausada que o HyperFrames percorre quadro a quadro. Sem `de`, vira `tl.to`.
- Tudo tem que ser determinístico: nada de `Math.random()`, relógio, `setTimeout` ou animação CSS infinita. O mesmo documento serve para o preview e para o arquivo exportado.
- Texto que passa do limite **avisa, nunca diminui a letra**.
- Uma cor de destaque por vídeo, num lugar só da peça. Texto nunca solto sobre a imagem (sempre com caixa, base ou véu). Nada de fundo chapado na cor de destaque.
- Escala de espaço de 8 px (8·16·24·32·48·64·96·128); margens e área de texto de cada formato estão em `tokens.json` → `area`.

## Licenças

Aktiv Grotesk (arquivo Trial) e Microgramma são fontes comerciais; os quadros de referência e os logos de outros veículos são de terceiros. Servem só para a revisão interna. Não use esses arquivos em peça publicada sem a licença conferida.
