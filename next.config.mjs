function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getSupabaseOrigin() {
  try {
    const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    return value ? new URL(value).origin : null;
  } catch {
    return null;
  }
}

function buildContentSecurityPolicy() {
  const isProduction = process.env.NODE_ENV === "production";
  const supabaseOrigin = getSupabaseOrigin();

  const connectSources = unique([
    "'self'",
    supabaseOrigin,
    "https://*.supabase.co",
    "wss://*.supabase.co",
    !isProduction ? "http://localhost:*" : null,
    !isProduction ? "http://127.0.0.1:*" : null,
    !isProduction ? "ws://localhost:*" : null,
    !isProduction ? "ws://127.0.0.1:*" : null
  ]);

  const directives = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "frame-ancestors": ["'self'"],
    "form-action": ["'self'"],
    "script-src": unique(["'self'", "'unsafe-inline'", !isProduction ? "'unsafe-eval'" : null]),
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": connectSources,
    "frame-src": ["'self'", "https://www.google.com", "https://maps.google.com"],
    "media-src": ["'self'", "https:"],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'", "blob:"]
  };

  const policy = Object.entries(directives)
    .map(([key, value]) => `${key} ${value.join(" ")}`)
    .join("; ");

  return isProduction ? `${policy}; upgrade-insecure-requests` : policy;
}

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy()
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=(), fullscreen=(self)"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN"
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
