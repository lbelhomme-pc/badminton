export interface HelloAssoProductInput {
  helloassoUrl?: string | null;
  reference?: string | null;
  quantity?: number | null;
}

export function isValidHelloAssoUrl(value: string | null | undefined) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith("helloasso.com");
  } catch {
    return false;
  }
}

export function buildHelloAssoProductUrl(input: HelloAssoProductInput) {
  if (!isValidHelloAssoUrl(input.helloassoUrl)) return null;

  const url = new URL(input.helloassoUrl as string);
  if (input.reference && !url.searchParams.has("cfvv_ref")) {
    url.searchParams.set("cfvv_ref", input.reference);
  }
  if (input.quantity && input.quantity > 1 && !url.searchParams.has("cfvv_quantite")) {
    url.searchParams.set("cfvv_quantite", String(Math.floor(input.quantity)));
  }

  return url.toString();
}

export function helloAssoMissingMessage() {
  return "Lien HelloAsso à configurer par le club.";
}
