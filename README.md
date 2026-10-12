# Site da PIB Barueri

Site institucional da Primeira Igreja Batista em Barueri, em https://pibbarueri.org.br. Ele substitui o site antigo, que ficava no Wix.

Não há banco de dados nem login. O que muda (agenda, horários, ministérios, "Quem somos", avisos, galeria de fotos e vídeos) vive em arquivos do Google que a equipe da igreja edita, e o site lê esses arquivos. A mudança aparece em até 10 minutos e não precisa de deploy.

## Stack

- Next.js 16 (App Router, Cache Components), React 19 e TypeScript
- Tailwind v4, com tema escuro fixo e a fonte Montserrat
- `ical.js` e `cheerio` para ler o Google Calendar e os Google Docs
- Hospedagem na Vercel (time `pibbtech`). O DNS fica na Vercel DNS e o domínio no Registro.br
- Google: Calendar, Docs, API do Drive, feed RSS do YouTube e um Apps Script para o formulário de contato

## De onde vem cada página

| Página | Fonte |
| --- | --- |
| Início | Imagens da pasta "Avisos" (carrossel), rotina semanal e próximos eventos do Calendar, último vídeo do YouTube |
| Quem somos | Google Doc "Quem somos" e dois PDFs do Drive |
| Ministérios | Google Doc "Ministerios" |
| Agenda | Google Calendar "PIBB Eventos" |
| Mensagens | Canal do YouTube @pibbarueri |
| Galeria | Pasta "Galeria de Fotos" do Drive, uma subpasta por álbum |
| Contato | Formulário, que passa por um Apps Script e chega por email em `contato@pibbarueri.org.br` |

Como a equipe edita cada um deles está em [docs/content-editing.md](docs/content-editing.md).

## Rodar na sua máquina

Precisa do Node 22 ou mais novo.

```bash
npm install
npm run dev
```

O site abre em http://localhost:3000. Sem nenhuma variável de ambiente ele funciona: os avisos e a galeria ficam vazios e o formulário mostra um aviso. Para ver avisos e galeria, crie um `.env.local` com a `GOOGLE_DRIVE_API_KEY` (veja [docs/drive-api-setup.md](docs/drive-api-setup.md)).

Antes de abrir um PR:

```bash
npx tsc --noEmit && npm run lint && npm run build
```

## Variáveis de ambiente

Ficam no projeto `site` da Vercel. Uma variável nova ou alterada só vale no próximo deploy.

| Nome | Tipo | Para quê |
| --- | --- | --- |
| `GOOGLE_DRIVE_API_KEY` | Config | Listar as pastas Avisos e Galeria de Fotos. Precisa ser Config, não Secret: uma Secret não chega ao build, e o carrossel demoraria a aparecer. Os motivos estão em [docs/drive-api-setup.md](docs/drive-api-setup.md) |
| `CONTACT_WEBHOOK_URL` | Secret | Endereço do Apps Script que envia o email do formulário |
| `CONTACT_WEBHOOK_SECRET` | Secret | Senha que o site e o Apps Script combinam entre si |

As duas do formulário valem só em Production. Passo a passo em [docs/contact-form-setup.md](docs/contact-form-setup.md). Sem elas o site funciona e o formulário mostra o email da igreja.

## Deploy

A produção sobe quando uma tag `v*` é enviada ao GitHub. Um merge na `main` não publica nada, porque o `vercel.json` desliga o deploy automático dela. Branches e PRs geram um link de teste na Vercel.

```bash
git checkout main && git pull
git tag vX.Y.Z && git push origin vX.Y.Z
```

O workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) baixa as variáveis (`vercel pull`), monta o site (`vercel build --prod`) e publica (`vercel deploy --prebuilt --prod`). Ele usa três secrets do repositório: `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`. O token tem data de validade, então anote quando renová-lo.

Só mudança de código, de configuração (`src/lib/config.ts`) e de variável de ambiente pede uma tag nova. Mudar conteúdo no Google não pede.

**Desfazer um deploy:** na Vercel, abra Deployments, escolha o deploy de Production anterior e clique em "Promote to Production". Depois corrija o problema e publique uma tag nova.

## Como monitorar

- **Depois de publicar a tag:** `gh run watch -R pibbarueri/site` acompanha o workflow, e a aba Actions do repositório mostra o histórico. `vercel ls site --scope pibbtech` lista os deploys.
- **Site no ar:** `curl -sI https://pibbarueri.org.br | head -1` deve devolver 200, e `www.pibbarueri.org.br` deve redirecionar (308) para o endereço sem `www`.
- **Erros em execução:** no painel da Vercel, em Logs, ou com `vercel logs <endereço-do-deploy> --scope pibbtech`. No plano gratuito os logs são guardados por pouco tempo.
- **Uma seção vazia no site:** quase sempre é o compartilhamento do arquivo do Google (precisa estar como "qualquer pessoa com o link pode ver"), a chave da API ou uma série semanal do calendário que terminou. As regras estão no [CLAUDE.md](CLAUDE.md).
- **DNS e email:** `dig +short NS pibbarueri.org.br` deve devolver `ns1.vercel-dns.com` e `ns2.vercel-dns.com`, e `dig +short MX pibbarueri.org.br` deve listar os servidores do Google. Não apague os registros de email (MX, SPF, DKIM e DMARC) da zona na Vercel.
- **Qualidade:** a meta no Lighthouse mobile é 90 ou mais em desempenho e 100 em acessibilidade.

Não há alerta automático nem monitor de disponibilidade configurado. Um monitor gratuito apontando para o domínio avisaria se o site cair.

## Documentação

- [docs/content-editing.md](docs/content-editing.md): como a equipe edita cada conteúdo
- [docs/drive-api-setup.md](docs/drive-api-setup.md): a chave da API do Drive
- [docs/contact-form-setup.md](docs/contact-form-setup.md): o formulário de contato
- [CLAUDE.md](CLAUDE.md): convenções do código e armadilhas conhecidas

## Contribuir

Crie a branch a partir da `main` (`feat/...`), escreva os commits em inglês no formato Conventional Commits e abra o PR com o template do repositório. PR que muda uma tela leva screenshots, e o `CLAUDE.md` explica como gerá-las. O código fica em inglês, e o texto que aparece na tela, em português.
