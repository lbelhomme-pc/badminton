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

const isProduction = process.env.NODE_ENV === "production";

function buildContentSecurityPolicy() {
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
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains"
        }
      ]
    : []),
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin"
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off"
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none"
  }
];

const privateNoIndexHeaders = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow, noarchive"
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/inscriptions",
        destination: "/inscription",
        permanent: true
      },
      {
        source: "/compte",
        destination: "/espace-adherent",
        permanent: true
      },
      {
        source: "/volants",
        destination: "/commande-volants",
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      },
      {
        source: "/admin/:path*",
        headers: privateNoIndexHeaders
      },
      {
        source: "/espace-adherent",
        headers: privateNoIndexHeaders
      },
      {
        source: "/compte",
        headers: privateNoIndexHeaders
      },
      {
        source: "/documents",
        headers: privateNoIndexHeaders
      },
      {
        source: "/commande-volants",
        headers: privateNoIndexHeaders
      },
      {
        source: "/reservation-creneau",
        headers: privateNoIndexHeaders
      },
      {
        source: "/mes-reservations",
        headers: privateNoIndexHeaders
      }
    ];
  }
};

export default nextConfig;
