import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/SiteHeader";
import { LeafBackground } from "@/components/LeafBackground";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ayusense — Intelligent Ayurvedic Wisdom" },
      { name: "description", content: "AI-powered Ayurvedic plant identification and personalized natural remedies grounded in a 700+ herb database." },
      { property: "og:title", content: "Ayusense — Intelligent Ayurvedic Wisdom" },
      { property: "og:description", content: "AI-powered Ayurvedic plant identification and personalized natural remedies grounded in a 700+ herb database." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Ayusense — Intelligent Ayurvedic Wisdom" },
      { name: "twitter:description", content: "AI-powered Ayurvedic plant identification and personalized natural remedies grounded in a 700+ herb database." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/421e10e8-0b35-415f-b35a-fde52a281df1/id-preview-0337962c--03d48e9a-08fa-4643-8661-cc0249e0301d.lovable.app-1777839680207.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/421e10e8-0b35-415f-b35a-fde52a281df1/id-preview-0337962c--03d48e9a-08fa-4643-8661-cc0249e0301d.lovable.app-1777839680207.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", href: "/favicon.png" }, 
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <LeafBackground />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
      {/* <footer id="contact" className="mx-auto mt-20 max-w-6xl border-t border-border/60 px-6 py-8 text-center text-xs text-muted-foreground"> */}
          <footer className="border-t border-border bg-muted/30 mt-20" id="contact">
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="font-serif text-2xl text-primary font-semibold mb-4">
          🌿 Preserving Ancient Wisdom Through AI
        </p>
        <div className="flex justify-center gap-6 mb-8 text-muted-foreground text-sm">
          <a href="#" className="hover:text-primary transition-colors">Twitter</a>
          <a href="#" className="hover:text-primary transition-colors">Instagram</a>
          <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-primary transition-colors">GitHub</a>
        </div>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
          ⚕️ Disclaimer: This platform provides guidance for minor ailments only. 
          Consult a medical professional for serious conditions. Ayusense does not replace professional medical advice.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          © 2026 Ayusense. All rights reserved.
        </p>
      </div>
    </footer>
    </>
  );
}
