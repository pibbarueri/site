# Como editar o conteúdo do site

O site lê quatro arquivos do Google. Quem edita não precisa de código nem de acesso à Vercel. A mudança aparece no site em até 10 minutos.

## Agenda

Edite o calendário **PIBB Eventos** no Google Agenda. Título, horário, local e descrição aparecem na página Agenda e na página inicial. Eventos que se repetem (semanais, mensais) funcionam. Eventos de dia inteiro e de vários dias também.

O calendário precisa continuar público (Configurações do calendário, Permissões de acesso, Disponibilizar para o público).

## Horários de culto e novidades

Planilha do Google com duas abas. Os nomes das abas e das colunas precisam ficar exatamente assim, em minúsculas e sem acento nos nomes das abas.

Aba `horarios` (os horários que aparecem na página inicial):

| dia | hora | nome | observacao |
| --- | --- | --- | --- |
| Domingo | 18h30 | Culto | |

Se a aba estiver vazia, o site usa os horários padrão que estão no código.

Aba `novidades` (os avisos da página inicial, os 3 mais recentes por data):

| data | titulo | texto | link | ativo |
| --- | --- | --- | --- | --- |
| 18/10/2026 | Batismo | Domingo, no culto da noite. | | SIM |

A data pode ser `DD/MM/AAAA` ou `AAAA-MM-DD`. Escreva `NAO` na coluna `ativo` para esconder um aviso sem apagar a linha. `link` e `observacao` são opcionais.

A planilha precisa estar compartilhada como "Qualquer pessoa com o link pode ver". Para quem edita, compartilhe a edição pelo email de cada pessoa. Evite "Qualquer pessoa com o link pode editar", porque qualquer um que tenha o link poderia mudar o que aparece no site.

## Ministérios

Documento do Google **Ministerios**. Cada ministério é um título no estilo Título 1, seguido de parágrafos e listas. Para a liderança, escreva uma linha começando com `Liderança:` (ela ganha destaque discreto). O título "Grupos Pequenos" vira o cartão largo do final.

O documento também precisa estar como "Qualquer pessoa com o link pode ver".

## Vídeos

Vêm do canal do YouTube @pibbarueri, sem nada a fazer. Os 12 mais recentes aparecem na página Mensagens, e o mais recente na página inicial.
