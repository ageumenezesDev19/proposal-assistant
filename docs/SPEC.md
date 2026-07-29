# Especificação do produto — Assistente de propostas para freelancer

> Fase 0 do plano. Documento vivo: fecha o escopo antes de escrever código, para não construir
> features que não provam nada ao recrutador nem servem ao uso diário.

## O problema

Aplicar para vagas no Upwork bem feito custa tempo: ler o anúncio, entender o que o cliente
realmente precisa, escrever uma proposta personalizada (proposta genérica não converte), e depois
não ter ideia do que funcionou. O resultado é aplicar pouco, aplicar mal, ou os dois.

## Para quem

O usuário primário é o próprio Ageu — freelancer entrando no mercado internacional. Isso é
deliberado: o produto precisa ser usado de verdade todos os dias, senão vira mais um projeto de
portfólio morto. O segundo público são outros freelancers com o mesmo problema.

## O que o produto faz

1. **Analisa a vaga.** O usuário cola o anúncio. A IA extrai: requisitos técnicos, faixa de
   orçamento, prazo, o problema de negócio por trás do pedido, e sinais de alerta (escopo vago,
   orçamento incompatível, pedido de trabalho de graça).
2. **Rascunha a proposta.** Usando o perfil e os cases que o usuário cadastrou uma vez, a IA escreve
   uma proposta específica para aquela vaga — citando o case mais relevante.
3. **Edita e salva.** O usuário ajusta o texto, salva trechos que funcionam como blocos reutilizáveis.
4. **Acompanha o resultado.** Marca cada proposta como enviada, respondida ou ganha, e vê a taxa de
   resposta por tipo de vaga.

## Escopo da v1 (o que entra)

- Autenticação (e-mail + link mágico, sem senha para gerenciar)
- Perfil do usuário: bio, stack, 3 a 5 cases com resultado
- Análise de vaga colada, com resposta em streaming
- Geração de proposta, editável
- Blocos reutilizáveis
- Lista de propostas com status e dashboard de taxa de resposta
- **Modo demonstração**: dados semeados e respostas pré-gravadas, sem cadastro
- Português e inglês

## O que fica de fora da v1

Integração automática com a API do Upwork (exigiria aprovação deles), envio automático de proposta
(viola os termos das plataformas), colaboração em equipe, pagamento/assinatura, app mobile.

## Por que este projeto prova o que precisa ser provado

| O que o mercado cobra | Como aparece aqui |
|---|---|
| Dashboard com dados reais | Funil e taxa de resposta por tipo de vaga |
| Fluxo completo, não só login | Vaga → análise → rascunho → edição → envio → resultado |
| Autenticação e dados por usuário | Supabase Auth + RLS, isolamento verificado |
| IA aplicada a problema real | Extração estruturada + geração com contexto do perfil |
| Decisão de engenharia | Camada de IA agnóstica com fallback entre provedores |
| Produto que roda | Deploy público, modo demo, Lighthouse 90+ |

## Decisões técnicas

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · shadcn/ui · Supabase (Auth + Postgres +
RLS) · Vercel. É a mesma base do sistema do cliente, o que mantém o perfil coerente.

**IA — camada agnóstica com fallback.** Groq (Llama 3.3 70B) como provedor principal: ~750 tokens/s,
o que faz o streaming parecer instantâneo, e **não treina com o conteúdo enviado** — importante,
porque o usuário cola anúncios e dados de perfil. Gemini 2.0 Flash como reserva quando o limite do
Groq estourar. A interface nunca quebra por limite de cota: cai para o reserva e, em último caso,
para o modo demonstração.

**Saída estruturada.** A análise da vaga retorna JSON validado com Zod, não texto solto — assim a
interface pode montar cartões de requisito, orçamento e alerta em vez de despejar um parágrafo.

**Custo: R$ 0.** Vercel, Supabase, Groq e Gemini em camada gratuita. Camada gratuita costuma proibir
uso comercial: para uso pessoal e portfólio está dentro das regras.

## Nome — opções para você escolher

| Nome | Raciocínio | Domínio provável |
|---|---|---|
| **Pitchfolio** | Junta *pitch* (a proposta) com *portfolio* (os cases que alimentam ela). Diz o que faz e soa a produto. | pitchfolio.app |
| **Winrate** | Nome curto, focado no resultado, não na ferramenta. Combina com o dashboard ser o coração do produto. | winrate.app |
| **Briefly** | De *brief*; sugere leveza e rapidez ao transformar um anúncio em proposta. | brieflyapp.com |
| **ProposalKit** | Descritivo e direto. Menor risco, menor personalidade. | — |

Recomendação: **Pitchfolio** — é o único que carrega a ideia central do produto (a proposta nasce
dos seus cases) e não é genérico.

## Direção visual (a definir na próxima etapa)

O produto precisa de identidade **própria**, distinta do portfólio (navy + âmbar). Ponto de partida
para a conversa: é uma ferramenta de trabalho usada todo dia, então precisa ser calma e legível por
horas — o oposto de uma landing page chamativa. A skill `frontend-design` será invocada para fechar
paleta, tipografia e o elemento de assinatura antes de qualquer tela.
