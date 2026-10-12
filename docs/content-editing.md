# Como editar o conteúdo do site

O site lê cinco arquivos do Google. Quem edita não precisa de código nem de acesso à Vercel. A mudança aparece no site em até 10 minutos.

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

## Quem somos

Documento do Google **Quem somos**. A estrutura do documento define a página:

- O primeiro **Título 1** é o título da página ("Quem somos").
- O primeiro parágrafo logo abaixo, se for curto (até 140 caracteres), vira a frase de destaque no alto da página. Os parágrafos seguintes, até o primeiro Título 2, são o texto de abertura.
- Cada **Título 2** abre uma seção ("O que acreditamos", "Instituição", "Começo"), com os parágrafos e listas que vierem depois dele.
- Cada **Título 1 a partir do segundo** vira um cartão de pessoa, como o do pastor. O primeiro parágrafo é o nome, o segundo é o cargo (curto), o terceiro é o resumo que fica sempre visível, e o resto (parágrafos e listas) aparece em "Mais detalhes". Para incluir outra pessoa, crie um novo Título 1 com o mesmo formato.
- Use só Título 1 e Título 2. Títulos menores são ignorados.

Negrito, itálico e links colados no documento não aparecem no site, só o texto. Se você escrever um email ou um endereço começando com `https://`, ele vira link sozinho.

O documento também precisa estar como "Qualquer pessoa com o link pode ver".

### Confissão de Fé e Estatuto Social

Os dois PDFs aparecem como botões no bloco "Nossos documentos", logo depois do texto de abertura. Eles não vêm do documento "Quem somos": os links são fixos no site. Para atualizar um PDF, abra o arquivo no Drive, clique com o botão direito, escolha Gerenciar versões e envie a nova versão. O link continua o mesmo e o site mostra o arquivo novo, sem precisar de ninguém de tecnologia. Os dois arquivos precisam continuar compartilhados como "Qualquer pessoa com o link pode ver". Se um PDF novo tiver outro link (outro arquivo no Drive), aí é preciso pedir a troca no site.

## Ministérios

Documento do Google **Ministerios**. Cada ministério é um título no estilo Título 1, seguido de parágrafos e listas. Para a liderança, escreva uma linha começando com `Liderança:` (ela ganha destaque discreto). O título "Grupos Pequenos" vira o cartão largo do final.

O documento também precisa estar como "Qualquer pessoa com o link pode ver". Emails e endereços `https://` escritos no texto viram link, como no "Quem somos".

## Vídeos

Vêm do canal do YouTube @pibbarueri, sem nada a fazer. Os 12 mais recentes aparecem na página Mensagens, e o mais recente na página inicial.
