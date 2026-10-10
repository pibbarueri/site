"use client";

import { useState } from "react";
import { primaryButton } from "@/components/ui";

type Status = "idle" | "sending" | "sent" | "error";

const fieldClass =
  "mt-1 block w-full rounded border border-border bg-surface-raised px-3 py-2.5 text-white placeholder:text-muted focus:border-white";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErrorMessage(body.error ?? "Não foi possível enviar agora. Tente de novo em instantes.");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setErrorMessage("Sem conexão no momento. Tente de novo em instantes.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-lg border border-border bg-surface p-6">
        <p className="text-lg font-semibold">Mensagem enviada.</p>
        <p className="mt-2 text-muted">Obrigado pelo contato! Responderemos assim que possível.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-medium underline decoration-brand decoration-2 underline-offset-4"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Nome
        </label>
        <input id="name" name="name" type="text" required minLength={2} maxLength={100} autoComplete="name" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="subject" className="text-sm font-medium">
          Assunto <span className="text-muted">(opcional)</span>
        </label>
        <input id="subject" name="subject" type="text" maxLength={120} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="message" className="text-sm font-medium">
          Mensagem
        </label>
        <textarea id="message" name="message" required minLength={5} maxLength={3000} rows={6} className={fieldClass} />
      </div>

      {/* Honeypot: people never see it, bots fill it in. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" disabled={status === "sending"} className={`${primaryButton} disabled:opacity-60`}>
        {status === "sending" ? "Enviando..." : "Enviar mensagem"}
      </button>

      {status === "error" && (
        <p role="alert" className="text-sm text-white underline decoration-brand decoration-2 underline-offset-4">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
