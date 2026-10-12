# Chave da API do Google Drive (avisos e galeria)

O site lista as imagens das pastas **Avisos** e **Galeria de Fotos** pela API do Google Drive, que exige uma chave. A mesma chave serve para as duas. Sem a chave, o site funciona normalmente: a página inicial mostra só a tela de boas-vindas, sem carrossel, e a Galeria mostra "Em breve".

A chave só lê. Ela é restrita à API do Drive e só enxerga arquivos compartilhados por link, como a pasta Avisos.

## Passo a passo

Use a conta da igreja (`admin@pibbarueri.org.br`), nunca uma conta pessoal ou de trabalho.

1. Abra https://console.cloud.google.com e entre com a conta da igreja.
2. Crie um projeto com o nome "Site PIB Barueri". Se o Google pedir uma organização, escolha a da igreja.
3. Em APIs e serviços, Biblioteca, procure por **Google Drive API** e clique em Ativar.
4. Em APIs e serviços, Credenciais, clique em Criar credenciais e escolha **Chave de API**. Dê o nome "site-avisos".
5. Abra a chave criada. Em Restrições de API, escolha Restringir chave, marque só **Google Drive API** e salve. Deixe a restrição de aplicativo como "Nenhuma": as chamadas saem dos servidores da Vercel, que não têm endereço fixo.
6. Na Vercel, abra o projeto do site, Settings, Environment Variables, e crie `GOOGLE_DRIVE_API_KEY` com o valor da chave, para Production e Preview. Escolha o tipo **Config**, não Secret (veja "Config ou Secret" abaixo). **Não use o prefixo `NEXT_PUBLIC_` no nome**: é ele, e só ele, que manda uma variável para o navegador.
7. As variáveis só valem no próximo deploy. Publique uma tag nova e confira.

## Como conferir

Coloque uma imagem de teste na pasta Avisos e abra a página inicial, e crie uma subpasta com uma foto dentro de Galeria de Fotos e abra a aba Galeria. O carrossel e o álbum aparecem em até 10 minutos. Se algum não aparecer, confira nesta ordem:

- A pasta está como "Qualquer pessoa com o link pode ver" (as subpastas da galeria herdam isso, a menos que alguém tenha mudado o compartilhamento de uma delas).
- A variável `GOOGLE_DRIVE_API_KEY` existe na Vercel para Production e é do tipo Config.
- A Google Drive API está ativada no projeto e a chave está restrita a ela.
- O arquivo é uma imagem (PNG ou JPG), e não um PDF ou um documento.
- Na galeria, as fotos estão dentro de uma subpasta (álbum), e não soltas na pasta Galeria de Fotos.

## Config ou Secret

A Vercel oferece dois tipos de variável (no CLI, `--no-sensitive` é Config e `--sensitive` é Secret; o painel e o `CLAUDE.md` do pibbkids ainda usam o nome antigo, "Sensitive").

- **Nenhum dos dois vai para o navegador.** Isso depende só do prefixo `NEXT_PUBLIC_`, que esta variável não tem. Foi conferido: com uma chave de teste, ela não aparece no HTML, nos cabeçalhos, nem nos arquivos de JavaScript que o navegador baixa.
- **A diferença é a visibilidade no painel.** Uma Secret não pode ser lida de novo depois de criada e não é entregue ao `vercel pull`. Uma Config fica visível para quem tem acesso ao projeto na Vercel e pode ser baixada pelo CLI. As duas ficam criptografadas e chegam às funções do site do mesmo jeito.
- **Por que Config aqui:** o deploy de produção roda `vercel pull` e depois `vercel build`. Uma Secret chega ao build como a palavra "[SENSITIVE]", sem a chave. A página inicial é montada nesse build, sem avisos, e o carrossel só apareceria depois da primeira atualização do cache (10 minutos ou mais após o deploy). Com Config, o build já tem a chave e o carrossel aparece desde o primeiro acesso.
- **O risco é pequeno:** a chave só lê, é restrita à Google Drive API e só enxerga arquivos compartilhados por link. Quem a obtivesse só gastaria a cota gratuita do projeto, e dá para trocar a chave em um minuto (crie outra, atualize na Vercel e apague a antiga).

Se a regra da igreja for guardar toda chave como Secret, o código pode passar a ler os avisos só no momento do acesso, e aí uma Secret funciona. Isso muda a página inicial: o carrossel passa a chegar depois da primeira tela, e ela deixa de ser totalmente estática.

## Testar sem a chave

Para desenvolver sem a chave real, aponte o site para um servidor falso da API:

```bash
GOOGLE_DRIVE_API_KEY=teste DRIVE_API_URL=http://localhost:4010/files npm run build && npm run start
```

`DRIVE_API_URL` só existe para isso. Não configure na Vercel.
