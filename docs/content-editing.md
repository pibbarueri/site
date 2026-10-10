# Como editar o conteúdo do site

O site lê quatro arquivos do Google. Quem edita não precisa de código nem de acesso à Vercel. A mudança aparece no site em até 10 minutos.

## Agenda

Edite o calendário **PIBB Eventos** no Google Agenda. O site separa os eventos em dois tipos, sozinho, olhando como o evento se repete.

**Rotina (toda semana).** Evento que se repete toda semana por 8 semanas ou mais, como EBD, EBD+, culto e GPs. Ele não enche o calendário da Agenda. Aparece uma vez só, no quadro "Toda semana" no alto da página Agenda. O título, o dia, o horário e a descrição do quadro vêm do próprio evento.

**Eventos do calendário.** Todo o resto: evento de um dia só, evento mensal ou anual, evento de dia inteiro ou de vários dias, e série semanal curta (um curso de 6 semanas, por exemplo). Eles aparecem num calendário mensal na página Agenda (clique no dia para ver os detalhes) e nos "Próximos eventos" da página inicial. O calendário mostra o mês atual e os 11 seguintes.

### Cancelar ou mudar um dia da rotina

Use sempre "Este evento", nunca "Todos os eventos".

- **Não vai ter EBD ou culto num domingo:** abra o evento daquele dia, clique em Excluir e escolha "Este evento". O site mostra um aviso "Não haverá" naquela data.
- **O horário ou o nome muda num dia (por exemplo, "Culto de Natal"):** abra o evento daquele dia, edite e salve só "Este evento". O site mostra um aviso "Alterado" naquela data.

Se você apagar "Todos os eventos", a série inteira some, inclusive do quadro "Toda semana".

### Atenção: série semanal tem data final

Quando você cria EBD, culto ou GP toda semana, o Google pede até quando repetir. Passada essa data, o item some do quadro "Toda semana". Ele volta sozinho assim que uma série nova tiver um encontro nos próximos 45 dias. Se você criar a série nova antes de a antiga acabar, o item não some nunca. Se preferir esperar, o item fica fora do quadro durante o recesso e reaparece cerca de um mês e meio antes do primeiro encontro. Hoje, as séries terminam no fim de novembro (GP nos Lares) e em dezembro de 2026 (as demais).

### Outras regras

- Eventos de dia inteiro e de vários dias funcionam.
- O calendário precisa continuar público (Configurações do calendário, Permissões de acesso, Disponibilizar para o público).

## Horários de culto e novidades

Planilha do Google com duas abas. Os nomes das abas e das colunas precisam ficar exatamente assim, em minúsculas e sem acento nos nomes das abas.

Aba `horarios` (os horários que aparecem na página inicial):

| dia | hora | nome | observacao |
| --- | --- | --- | --- |
| Domingo | 18h30 | Culto | |

Se a aba estiver vazia, o site usa os horários padrão que estão no código. Atenção: o quadro "Toda semana" da Agenda vem do calendário, e estes horários vêm da planilha. Para mudar um horário de forma permanente, atualize os dois.

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
