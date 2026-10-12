# Ativar os avisos (chave da API do Google Drive)

O site lista as imagens da pasta **Avisos** pela API do Google Drive, que exige uma chave. Sem a chave, o site funciona normalmente e mostra só a tela de boas-vindas, sem carrossel.

A chave só lê. Ela é restrita à API do Drive e só enxerga arquivos compartilhados por link, como a pasta Avisos.

## Passo a passo

Use a conta da igreja (`admin@pibbarueri.org.br`), nunca uma conta pessoal ou de trabalho.

1. Abra https://console.cloud.google.com e entre com a conta da igreja.
2. Crie um projeto com o nome "Site PIB Barueri". Se o Google pedir uma organização, escolha a da igreja.
3. Em APIs e serviços, Biblioteca, procure por **Google Drive API** e clique em Ativar.
4. Em APIs e serviços, Credenciais, clique em Criar credenciais e escolha **Chave de API**. Dê o nome "site-avisos".
5. Abra a chave criada. Em Restrições de API, escolha Restringir chave, marque só **Google Drive API** e salve. Deixe a restrição de aplicativo como "Nenhuma": as chamadas saem dos servidores da Vercel, que não têm endereço fixo.
6. Na Vercel, abra o projeto do site, Settings, Environment Variables, e crie `GOOGLE_DRIVE_API_KEY` com o valor da chave, para Production e Preview. **Não marque Sensitive.** O build recebe a palavra "[SENSITIVE]" no lugar da chave, e o carrossel só apareceria depois da primeira atualização do cache.
7. As variáveis só valem no próximo deploy. Publique uma tag nova e confira.

## Como conferir

Coloque uma imagem de teste na pasta Avisos e abra a página inicial. O carrossel aparece em até 10 minutos. Se não aparecer, confira nesta ordem:

- A pasta está como "Qualquer pessoa com o link pode ver".
- A variável `GOOGLE_DRIVE_API_KEY` existe na Vercel para Production e não está marcada como Sensitive.
- A Google Drive API está ativada no projeto e a chave está restrita a ela.
- O arquivo é uma imagem (PNG ou JPG), e não um PDF ou um documento.

## Testar sem a chave

Para desenvolver sem a chave real, aponte o site para um servidor falso da API:

```bash
GOOGLE_DRIVE_API_KEY=teste DRIVE_API_URL=http://localhost:4010/files npm run build && npm run start
```

`DRIVE_API_URL` só existe para isso. Não configure na Vercel.
