// Google Apps Script web app that emails the site's contact form to the church inbox.
// Setup steps (in Portuguese) are in docs/contact-form-setup.md.
//
// Script property required: SECRET (same value as CONTACT_WEBHOOK_SECRET on Vercel).

const TO = "contato@pibbarueri.org.br";

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "invalid json" });
  }

  const secret = PropertiesService.getScriptProperties().getProperty("SECRET");
  if (!secret || data.secret !== secret) {
    return reply({ ok: false, error: "unauthorized" });
  }

  const subject = "[Site] " + (data.subject || "Mensagem do site");
  const body = "Nome: " + data.name + "\nEmail: " + data.email + "\n\n" + data.message;

  MailApp.sendEmail({
    to: TO,
    replyTo: data.email,
    subject: subject,
    body: body,
    name: "Site PIB Barueri",
  });
  return reply({ ok: true });
}

function reply(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
