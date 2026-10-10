# CLAUDE.md — PIBB Website

Site institucional da Primeira Igreja Batista em Barueri (`https://pibbarueri.org.br`). Substitui o
site antigo no Wix. Não tem banco de dados nem login: o conteúdo que muda mora em arquivos do
Google que a equipe da igreja edita, e o site lê esses arquivos.

- **use caveman skill if available**
- **use cavecrew skill if available**

## Stack

- Next.js 16 (App Router, Cache Components) + TypeScript
- Tailwind v4, sem biblioteca de componentes. Primitivos em `src/components/ui.tsx`
- `ical.js` (agenda, com eventos recorrentes) e `cheerio` (HTML do Google Docs)
- Hosting: Vercel. Repo público em `pibbarueri/site`

**Este não é o Next.js que você conhece.** Esta versão tem mudanças de API, de convenção e de
estrutura. Antes de escrever código, leia o guia certo em `node_modules/next/dist/docs/` e siga os
avisos de depreciação. `cacheComponents` está ligado em `next.config.ts`: cache é feito com
`"use cache"` + `cacheLife`, não com `export const revalidate` nem `fetch(..., { next })`.

## Conteúdo: o que a equipe edita

A equipe edita no Google e o site mostra a mudança em até 10 minutos. Quem edita não precisa de
código nem de acesso à Vercel. O passo a passo para a equipe está em `docs/content-editing.md`.

| O quê | Onde a equipe edita | Como o site lê | Código |
| --- | --- | --- | --- |
| Agenda e rotina semanal | Google Calendar "PIBB Eventos" | feed iCal público | `src/lib/calendar.ts`, `src/lib/ical-parse.ts` |
| Horários de culto | Planilha, aba `horarios` | CSV via `gviz` | `src/lib/sheet.ts` |
| Novidades (avisos) | Planilha, aba `novidades` | CSV via `gviz` | `src/lib/sheet.ts` |
| Ministérios e grupos pequenos | Google Doc "Ministerios" | export HTML | `src/lib/ministries.ts` |
| Vídeos | Canal do YouTube `@pibbarueri` | feed RSS | `src/lib/youtube.ts` |

Os IDs dos arquivos ficam em `src/lib/config.ts` (`SITE`). São públicos, não são segredo.

Regras desse esquema:

- **Todo dado do Google passa por uma função em `src/lib/` com `"use cache"` e `cacheLife`**
  (`stale: 300, revalidate: 600, expire: 86400`). Página nunca faz `fetch` direto no Google.
- **Falha do Google não derruba a página.** Cada função de leitura tem `try/catch` e devolve lista
  vazia (ou os horários padrão), e a página mostra um texto de "em breve". Não trocar isso por
  erro estourando no build.
- **Os arquivos do Google precisam estar como "qualquer pessoa com o link pode ver".** Se alguém
  fechar o compartilhamento, a seção correspondente fica vazia sem aviso. "Pode editar" por link é
  pior ainda: qualquer um mudaria o que aparece no site. Dê edição por email.
- Nomes de abas e colunas da planilha ficam em português (`horarios`: `dia`, `hora`, `nome`,
  `observacao`; `novidades`: `data`, `titulo`, `texto`, `link`, `ativo`), porque a equipe edita lá.
  O código mapeia para campos em inglês. Mudar um nome exige combinar com a equipe e atualizar
  `docs/content-editing.md`.
- **Ministérios**: cada Título 1 do documento vira um cartão. O texto até o próximo Título 1 vira o
  corpo, em parágrafos e listas, na ordem do documento. Linha começando com `Liderança:` ou
  `Líderes` ganha estilo discreto (`isLeadershipLine`). O título "Grupos Pequenos" vira o cartão
  largo (`slug === "grupos-pequenos"` em `src/app/ministerios/page.tsx`). Não renomear esse título
  sem ajustar o código. Parágrafo só de traços ou sublinhados é descartado.
- **Aba `horarios` vazia**: vale `DEFAULT_SCHEDULE` em `src/lib/config.ts`. Os horários oficiais
  estão lá, e mudar um horário permanente é editar a planilha, não o código.
- **Agenda: rotina x esporádico** (`src/lib/ical-parse.ts`, `parseCalendar`). Série que repete
  **toda semana por 8 semanas ou mais** (`ROUTINE_MIN_WEEKS`) é rotina: EBD, EBD+, culto, GPs.
  Ela não entra na lista da Agenda nem em "Próximos eventos". Vira uma linha do quadro "Toda
  semana" (`weekly`), com título, dia, horário e descrição tirados do próprio evento. Todo o resto
  é evento da lista: dia único, mensal, anual e série semanal curta (um curso de 6 semanas).
  A regra é por recorrência, sem etiqueta: ninguém precisa marcar nada no Calendar.
- **Cancelamento e mudança de uma ocorrência da rotina aparecem na lista.** Apagar um domingo só
  ("Este evento") põe um `EXDATE` na série, e o site mostra o card "Não haverá" (`kind:
  "cancelled"`). Editar um dia só (nome ou horário) cria uma exceção, e o card sai como "Alterado"
  (`kind: "changed"`). `STATUS:CANCELLED` também vira "Não haverá". Se mexer nesse trecho, testar
  com os três casos (EXDATE, exceção, série curta) e com o calendário real.
- **A série semanal tem data final** (`UNTIL`). Passada essa data, o item some do quadro "Toda
  semana". A equipe precisa renovar a série antes (`docs/content-editing.md` avisa isso).
- O quadro "Toda semana" da Agenda vem do Calendar. Já os "Horários" da página inicial vêm da
  aba `horarios` da planilha (ou de `DEFAULT_SCHEDULE`). São duas fontes, então mudança permanente
  de horário precisa ser feita nas duas.
- O Google Calendar às vezes grava a descrição do evento com HTML. `cleanDescription` em
  `ical-parse.ts` tira as tags. Texto novo vindo do Google passa por limpeza parecida.
- Não há CMS e não vai ter: se surgir pedido de painel de edição, avisar antes de implementar.

## Identidade visual

O guia da marca está num Canva (9 páginas, "Guia Identidade Visual PIBBARUERI"). O site segue ele:

- **Tema escuro fixo**, sem alternância para claro. Tokens em `src/app/globals.css`: fundo
  `#0a0a0a`, texto `#f5f5f5`, `--brand` `#bd0000`, cobre `#804f27`, marrom `#4b341f`.
  O `color-scheme` e o `themeColor` ficam em escuro.
- **Logo claro** (`public/logo.png`) em cabeçalho, rodapé e primeira tela. O ícone da aba
  (`src/app/icon.png`) é o logo escuro sobre branco, para aparecer em qualquer barra de abas.
- **Montserrat em tudo** (`next/font/google`). O guia pede estilos sérios e legíveis e proíbe
  cursivas. Sem serifa.
- **Contraste**: o vermelho e o cobre sobre o fundo escuro dão cerca de 3:1. Servem para botão com
  texto branco (mais de 6:1), borda, barra e título grande. **Texto pequeno ou link nunca em
  vermelho**: usar branco com sublinhado vermelho (`textLink` em `ui.tsx`). Texto secundário usa
  `text-muted` (`#a3a3a3`), não o cinza `#737373` do guia, que fica no limite.
- **Tom de voz** dos textos: acolhedor e sério, sem ser formal, em português simples. Sem gíria e
  sem estrangeirismo (é "Mensagens", não "Sermons"; "Agenda", não "Calendar"). Vale também nos
  avisos para crianças e adolescentes.
- Meta de qualidade: Lighthouse mobile com 90 ou mais em desempenho e 100 em acessibilidade.
  Rodar antes de abrir PR que mexa em layout ou cor.

## Convenções de código

- **Idioma**: todo código (arquivos, pastas, variáveis, funções, tipos, comentários) em inglês.
  Chat/conversa é em português. UI (labels visíveis) fica em pt-BR. **As URLs das páginas ficam em
  português** (`/quem-somos`, `/ministerios`, `/agenda`, `/mensagens`, `/contato`): são o que o
  visitante vê e batem com as do Wix. As rotas de API são em inglês (`/api/contact`).
- **Texto que veio do Google (ou de qualquer pessoa) usa `wrap-anywhere`**, nunca `break-words`.
  `overflow-wrap: break-word` não reduz o min-content, então uma URL comprida dentro de grid ou
  flex estoura o item e pode cortar o resto do card. `min-w-0` sozinho não resolve. Vale para
  título e descrição de evento, novidades, ministérios e títulos de vídeo.
- **Datas**: nunca usar `new Date()` solto para dia de calendário nem formatar sem fuso. Use
  `Intl.DateTimeFormat` com `timeZone: SITE.timeZone` (`America/Sao_Paulo`), como em
  `src/lib/format.ts`. Evento de dia inteiro é `YYYY-MM-DD`, evento com hora é ISO completo.
  Com Cache Components, `new Date()` fora de uma função `"use cache"` quebra o prerender da página.
  O relógio (`now`) só entra em `getCalendar`.
- Componentes client (`"use client"`) só quando precisa de estado ou evento do navegador (menu
  móvel, formulário). O resto é server component.
- Link externo leva `target="_blank" rel="noopener noreferrer"`.
- Componente novo reaproveita `ui.tsx` (`Section`, `PageTitle`, `Container`, botões, `textLink`).
- Acessibilidade é requisito: hierarquia de títulos, `aria-current` na navegação, foco visível,
  rótulos em todo campo.

## Formulário de contato

`src/components/contact-form.tsx` envia para `POST /api/contact` (`src/app/api/contact/route.ts`),
que repassa para um Google Apps Script que manda o email para `contato@pibbarueri.org.br`.

- Variáveis de ambiente na Vercel: `CONTACT_WEBHOOK_URL` e `CONTACT_WEBHOOK_SECRET` (a segunda,
  como Sensitive). O mesmo valor fica na propriedade `SECRET` do script. As duas são lidas em
  runtime pela função, não no build.
- Sem `CONTACT_WEBHOOK_URL` a rota responde 503 e o formulário mostra o email da igreja. Isso é o
  comportamento esperado em dev e em previews.
- Contra spam: campo escondido `website` (robô preenche, a rota responde "ok" e descarta) e limite
  de 3 envios por IP em 10 minutos. O limite é em memória por instância serverless, então freia
  abuso casual e não um ataque coordenado. Não prometer mais que isso.
- O código do script está em `docs/contact-apps-script.gs` e a instalação em
  `docs/contact-form-setup.md`.

## Redirecionamentos do Wix

`next.config.ts` redireciona as URLs antigas do Wix (`/jovens`, `/casais-1`, `/localizacao`...)
para as páginas novas, com 308 permanente. Mantém link antigo e posição no Google. Não remover.

## Git Workflow

### Branches

- Crie branches sempre a partir da `main` (nunca commit direto na `main`)
- Todo trabalho em branch própria (feature branch)
- nomes devem seguir o padrão de nomenclatura do [Conventional Branch](https://conventionalbranch.org)
- sempre use `rebase` ao invés de `merge` quando for sincronizar uma branch com a `main`

### Commits

- Commits pequenos, um por mudança lógica (um commit deve ser um "entregável" completo)
- Mensagem sem atribuição de IA, seguindo as convenções do [Conventional Commits](https://www.conventionalcommits.org), sempre em inglês
- Nunca use "co-authored" ou qualquer outra menção de AI em commits/PRs

### Pull Requests

- Mantenha a descrição do PR focada em informações relevantes e fácil de ler rapidamente; não a transforme em um CHANGELOG
- Siga o arquivo `.github/pull_request_template.md` para obter detalhes e preencha-o adequadamente ao criar PRs.
- Busque manter um histórico de commits claro e descrições de PR detalhadas para facilitar as revisões.
- NUNCA mencione que um assistente ou IA trabalhou na alteração, e NUNCA adicione atribuições a IA/assistentes ou rodapés do tipo "Gerado com..." às ​​descrições dos PRs.
- Título no formato Conventional Commits, em inglês, e label `enhancement`, `bug`, etc.
- Adote o estilo de PR preferido do repositório:
  - resumo conciso da alteração
  - lista simples de tópicos para comportamentos relevantes, endpoints, efeitos colaterais, documentação, etc
  - screenshots da alteração, obrigatórias quando o PR muda tela (ver "Screenshots no PR"). A
    Vercel também comenta o link do preview no PR

- **Avisar ANTES de implementar** se um pedido não encaixa bem no modelo atual (escopo ambíguo,
  algo que pediria banco de dados ou login) — não implementar e descobrir o problema no meio.

## Deploy

App na Vercel (time `pibbtech`), domínio `pibbarueri.org.br`. A zona DNS fica na Vercel DNS, e o
registro do domínio é no Registro.br (o contato técnico é o Gilmar). **Os registros de email do
Google Workspace (MX, SPF, DKIM em `google._domainkey`, DMARC) vivem nessa zona. Não apagar.**

**Deploy de produção acontece no push de uma tag `v*`, não no merge na `main`.** Mesmo fluxo do
pibbkids: `.github/workflows/deploy.yml` (`vercel pull` → `vercel build` → `vercel deploy
--prebuilt --prod`). O `vercel.json` desliga o deploy automático da `main`, e branches continuam
gerando preview na Vercel. Merge na `main` não sobe nada sozinho. Pra publicar:

```bash
git checkout main && git pull
git tag vX.Y.Z && git push origin vX.Y.Z
```

Secrets do workflow (Settings → Secrets and variables → Actions): `VERCEL_TOKEN`,
`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Env vars do app continuam no projeto da Vercel, o
`vercel pull` busca de lá.

Trocar conteúdo (agenda, ministérios, avisos, horários) **não precisa de deploy**. Só código, dado
em `config.ts` e variáveis de ambiente pedem tag nova.

## Verificação antes de abrir PR

```bash
npx tsc --noEmit && npm run lint && npm run build
```

O `npm run build` mostra a coluna `Revalidate` das páginas com dado do Google (esperado: `10m` e
`1d`). Pra ver o resultado, `npm run start` e abrir no navegador, de preferência em largura de
celular. Mudou leitor do Google? Teste contra o arquivo real, não só contra exemplo.

## Screenshots no PR

Todo PR que muda tela leva screenshots na descrição, como prova da alteração. O GitHub não aceita
upload de imagem por linha de comando, então as imagens ficam numa branch só para isso.

1. Abra o PR primeiro, para saber o número (`<n>`).
2. Com o site rodando (`npm run build && npm run start`, porta 3000), tire as capturas:

   ```bash
   node scripts/pr-screenshots.mjs /tmp/shots              # todas as páginas
   node scripts/pr-screenshots.mjs /tmp/shots / /contato   # só as que mudaram
   ```

   O script gera `<tela>-desktop.png` e `<tela>-mobile.png`, página inteira. Precisa de Chromium
   ou Chrome (`CHROME_PATH` se não estiver no lugar padrão do macOS) e de `BASE_URL` se a porta
   não for a 3000.
3. Converta para JPEG, para as imagens não pesarem:
   `sips -s format jpeg -s formatOptions 85 x.png --out x.jpg`.
4. Suba em `pr-<n>/` na branch **`pr-screenshots`**. Ela só tem imagens, nunca recebe merge e tem
   um `vercel.json` que desliga o deploy dela. Se ainda não existir na sua cópia, `git fetch`;
   para mexer nela, use um clone ou worktree à parte, nunca a pasta do código.
5. Na descrição do PR, seção "Screenshots", aponte para
   `https://raw.githubusercontent.com/pibbarueri/site/pr-screenshots/pr-<n>/<tela>-desktop.jpg`
   (o repo é público, então o link abre sem login). Veja o PR #1 como modelo de tabela.

Observações:

- As capturas usam os dados reais do Google (calendário, documento, canal do YouTube). Elas mudam
  com o tempo e isso não é bug.
- O player do YouTube não aparece em navegador sem interface. Por isso a última mensagem é uma
  miniatura com botão de play (`src/components/video-embed.tsx`).
- Sessão sem navegador (nuvem): escreva isso na seção e descreva o que conferir à mão.

## Sessões na nuvem (claude.ai/code)

O repo também é trabalhado por sessões rodando em container da Anthropic, despachadas do
celular. Se você é uma delas, saiba o que não dá:

- **Sem secrets**: não há token da Vercel nem URL do Apps Script. Não contornar nem pedir.
- **Sem dev server visível** → nada de verificação por
  `preview_start`. Verificar por `tsc`/lint e descrever o que precisa ser conferido à mão.
- **Escopo**: código, branch, PR. Não criar tag de versão por conta própria: tag dispara deploy
  de produção.
