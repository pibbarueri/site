import { NextResponse } from "next/server";
import { SITE } from "@/lib/config";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const attempts = new Map<string, number[]>();

// Simple per-IP limit. Each serverless instance keeps its own count, so this slows
// casual abuse down but does not stop a coordinated one.
function isOverLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    attempts.set(ip, recent);
    return true;
  }
  recent.push(now);
  attempts.set(ip, recent);
  return false;
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Messages are shown to visitors, so they stay in Portuguese.
const fail = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("Requisição inválida.", 400);
  }

  // Bots fill the hidden field. Answer as if it worked.
  if (text(body.website, 200)) return NextResponse.json({ ok: true });

  const name = text(body.name, 100);
  const email = text(body.email, 200);
  const subject = text(body.subject, 120);
  const message = text(body.message, 3000);

  if (name.length < 2) return fail("Informe seu nome.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Informe um email válido.", 400);
  if (message.length < 5) return fail("Escreva sua mensagem.", 400);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isOverLimit(ip)) {
    return fail("Você enviou mensagens demais. Tente de novo em alguns minutos.", 429);
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) {
    return fail(`O formulário ainda não está ativo. Escreva para ${SITE.email}.`, 503);
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.CONTACT_WEBHOOK_SECRET ?? "",
        name,
        email,
        subject,
        message,
      }),
      redirect: "follow",
    });
    const result = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!res.ok || !result?.ok) {
      return fail(`Não foi possível enviar agora. Escreva para ${SITE.email}.`, 502);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return fail(`Não foi possível enviar agora. Escreva para ${SITE.email}.`, 502);
  }
}
