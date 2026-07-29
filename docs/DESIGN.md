# Pitchfolio — sistema de design

## A ideia central

Uma proposta é uma **carta**. O que a IA produz não é "saída de modelo": é um rascunho de documento
que alguém vai ler. E o que ela descobre sobre a vaga não é um relatório separado: são **anotações
de margem**, como um editor faz num manuscrito.

Todo o resto do sistema sai daí:

- O rascunho é composto em **serifa, em tamanho de leitura** — porque é um texto para ser lido, não
  um campo de formulário
- A análise da IA (requisitos, orçamento, alertas) vive numa **coluna de margem** ao lado do
  rascunho, alinhada ao trecho a que se refere — não num painel separado nem num modal
- Os números (taxa de resposta, valores, datas) são **monoespaçados**, porque são um livro-caixa

**Elemento de assinatura:** a margem anotada, com um fio fino ligando cada anotação ao parágrafo do
rascunho que ela comenta.

## Cor

| Token | Valor | Uso |
|---|---|---|
| `paper` | `#FBFAF7` | Fundo. Quente, mas menos amarelado que o creme padrão |
| `paper-sunk` | `#F2F0EA` | Superfícies rebaixadas: campo de colar, coluna de margem |
| `ink` | `#1F1D1A` | Texto principal. Preto quente de tinta, nunca `#000` |
| `ink-soft` | `#6B665D` | Texto secundário, rótulos, metadados |
| `rule` | `#E2DFD6` | Fios e bordas. Sempre 1px |
| `moss` | `#3E5641` | **O acento único.** Ações, estado ativo, proposta ganha |
| `flag` | `#A6432F` | **Só sinal de risco.** Nunca decorativo, nunca em botão comum |

A escolha do musgo é deliberada: o acento óbvio para "papel quente + serifa" seria terracota, que é
justamente o clichê. O verde também trabalha semanticamente — é a cor de "ganhou" no livro-caixa,
então o acento da marca e o sinal de sucesso são a mesma coisa, sem precisar de uma cor a mais.

O terracota não sumiu: virou `flag`, exclusivo de alerta na vaga. Cor de aviso não pode ser a mesma
cor de botão, senão o aviso perde força.

## Tipografia

| Papel | Família | Por quê |
|---|---|---|
| Documento e títulos | **Newsreader** | Serifa de leitura com voz editorial de verdade. Fugi de Playfair e Lora, que são o par automático de qualquer layout "editorial" |
| Interface | **IBM Plex Sans** | Neutra e humanista, com um toque técnico. Não é Inter, que está em todo lugar |
| Dados e metadados | **IBM Plex Mono** | Mesma família do sans — decisão de sistema, não três fontes aleatórias |

A regra que faz isso significar algo: **serifa é conteúdo, sans é ferramenta, mono é número.** O
rascunho da proposta em serifa; os botões e rótulos em sans; a taxa de resposta e as datas em mono.

Escala: 13 / 15 / 17 / 21 / 28 / 40px. O rascunho fica em 17px com entrelinha 1.7 — tamanho de
leitura confortável, não tamanho de formulário.

## Layout

```
┌──────────────────────────────────────────────────────────┐
│  Pitchfolio          Proposals   Cases            ○      │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────┬───────────────────────┐  │
│  │  Proposal for              │  ANALYSIS             │  │
│  │  Shopify inventory dash…   │  ───────────          │  │
│  │  ────────────────────      │                       │  │
│  │                            │  Requirements         │  │
│  │  Hi Sarah,                 │  React · Shopify API  │  │
│  │                        ────┼─ Budget               │  │
│  │  You mentioned the team    │  $3–5k · 4 weeks      │  │
│  │  loses two hours a day…    │                       │  │
│  │                        ────┼─ ⚑ Watch out          │  │
│  │  [rascunho em serifa]      │  "Reporting" is not   │  │
│  │                            │  specified            │  │
│  └────────────────────────────┴───────────────────────┘  │
│         documento (serifa)         margem (sans + mono)  │
└──────────────────────────────────────────────────────────┘
```

No celular a margem desce e vira cartões de anotação abaixo do rascunho, mantendo a ligação por um
rótulo com o trecho citado.

## Movimento

Contido, e sempre a serviço de entender o que aconteceu:

- O rascunho aparece **em streaming**, palavra a palavra — o que já é a animação principal, e é real
- As anotações da margem entram **uma a uma**, na ordem em que a IA as descobre
- Nada mais se move. Sem parallax, sem números que sobem, sem cartões que flutuam
- `prefers-reduced-motion` desliga o stagger e mantém o streaming (que é informação, não enfeite)

## Regras de escrita da interface

- Rótulo de botão = o que acontece: "Analyse job post", não "Submit"
- O nome da ação não muda no meio do fluxo: quem clica em "Save draft" vê "Draft saved"
- Estado vazio é convite, não aviso: mostra um exemplo e o próximo passo
- Erro diz o que houve e o que fazer, sem pedir desculpa
- Sem "AI-powered", sem "revolucionário". O produto mostra, não anuncia

## Piso de qualidade

Responsivo a partir de 360px · alvos de toque ≥ 44px · foco visível em tudo que é navegável por
teclado · contraste AA · `prefers-reduced-motion` respeitado.
