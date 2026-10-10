# Ativar o formulário de contato

O formulário do site envia a mensagem para um pequeno script do Google (Apps Script), que manda o email para `contato@pibbarueri.org.br`. Enquanto isso não estiver configurado, o site mostra um aviso com o endereço de email da igreja.

## Passo a passo

1. Entre em https://script.google.com com a conta `admin@pibbarueri.org.br`.
2. Clique em Novo projeto e dê o nome "Formulário do site PIB".
3. Apague o código que vem pronto e cole o conteúdo de [contact-apps-script.gs](contact-apps-script.gs).
4. Em Configurações do projeto, role até Propriedades do script e adicione uma propriedade chamada `SECRET`. O valor é uma senha longa e aleatória. Para gerar uma:

   ```bash
   openssl rand -hex 24
   ```

5. Clique em Implantar, depois em Nova implantação. Escolha o tipo App da Web, com estas opções:
   - Executar como: Eu
   - Quem tem acesso: Qualquer pessoa

   O Google vai pedir permissão para enviar email em seu nome. Autorize.
6. Copie o URL do app da Web. Ele termina em `/exec`.
7. Na Vercel, abra o projeto do site, depois Settings, Environment Variables, e crie duas variáveis para Production e Preview:
   - `CONTACT_WEBHOOK_URL`: o URL do passo 6
   - `CONTACT_WEBHOOK_SECRET`: o mesmo valor da propriedade `SECRET` do passo 4 (marque como Sensitive)
8. As variáveis só valem no próximo deploy. Publique uma nova tag de versão e teste enviando uma mensagem pelo site.

## Se mudar o script

Qualquer alteração no código exige Implantar, Gerenciar implantações, Editar, Nova versão. O URL continua o mesmo.
