import { createClient } from "@supabase/supabase-js";

interface EmailInput {
  html: string;
  subject: string;
}

export interface AdminEmailResult {
  sent: boolean;
  message: string;
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function configuredRecipients() {
  return (process.env.ADMIN_NOTIFICATION_EMAILS ?? "")
    .split(/[;,]/)
    .map((email) => email.trim().toLowerCase())
    .filter(validEmail);
}

export function escapeEmailHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

async function adminRecipients() {
  const recipients = new Set(configuredRecipients());
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return [...recipients];

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const [{ data: roleRows }, { data: legacyAdmins }] = await Promise.all([
    adminClient.from("user_roles").select("user_id").in("role", ["admin", "super_admin"]),
    adminClient.from("profiles").select("id, email").eq("role", "admin")
  ]);
  const adminIds = [...new Set([...(roleRows ?? []).map((row) => row.user_id), ...(legacyAdmins ?? []).map((row) => row.id)])];
  if (adminIds.length > 0) {
    const { data: profiles } = await adminClient.from("profiles").select("email").in("id", adminIds);
    (profiles ?? []).forEach((profile) => {
      if (profile.email && validEmail(profile.email)) recipients.add(profile.email.toLowerCase());
    });
  }
  return [...recipients];
}

export async function sendAdminNotificationEmail(input: EmailInput): Promise<AdminEmailResult> {
  if (process.env.RESERVATION_EMAIL_NOTIFICATIONS_ENABLED !== "true") {
    return { sent: false, message: "Notifications email désactivées par le club." };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const recipients = await adminRecipients();
  if (!resendApiKey || !fromEmail || recipients.length === 0) {
    return { sent: false, message: "Configuration email incomplète : clé Resend, expéditeur ou destinataire manquant." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromEmail, to: recipients, subject: input.subject, html: input.html })
  });
  if (!response.ok) {
    let details = "";
    try {
      const payload = (await response.json()) as { message?: string };
      details = payload.message ? ` : ${payload.message}` : "";
    } catch {
      // Keep a generic message if Resend does not return JSON.
    }
    return { sent: false, message: `Resend a refusé l'envoi${details}.` };
  }
  return { sent: true, message: "Administrateurs prévenus par email." };
}
