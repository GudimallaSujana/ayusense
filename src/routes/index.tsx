import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Stethoscope } from "lucide-react";
import heroImg from "@/assets/herbs-hero.jpg";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  return (
    <div>
      <section className="relative -mx-6 overflow-hidden rounded-b-3xl">
        <img src={heroImg} alt="Ayurvedic herbs" className="absolute inset-0 h-full w-full object-cover opacity-100" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />
        <div className="relative px-6 py-24 text-center">
          <h1 className="font-display text-6xl text-primary md:text-7xl">Ayusense</h1>
          <p className="mt-2 font-display text-xl italic text-saffron">Intelligent Ayurvedic Wisdom</p>
          <p className="mx-auto mt-5 max-w-xl text-foreground/80">
            Combining Ancient Wisdom with Artificial Intelligence for Personalized Natural Healing.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
        <OptionCard
          to="/identify"
          icon={<Leaf className="h-6 w-6 text-leaf" />}
          title="Identify Medicinal Plant"
          desc="Upload a plant image to discover its Ayurvedic benefits, uses, and safe remedies."
          cta="Upload Plant →"
        />
        <OptionCard
          to="/remedy"
          icon={<Stethoscope className="h-6 w-6 text-leaf" />}
          title="Find Ayurvedic Remedy"
          desc="Enter your symptoms to receive personalized Ayurvedic plant recommendations."
          cta="Check Remedies →"
        />
      </section>
    </div>
  );
}

function OptionCard({ to, icon, title, desc, cta }: { to: string; icon: React.ReactNode; title: string; desc: string; cta: string }) {
  return (
    <Link to={to} className="group rounded-3xl border border-border/60 bg-card p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">{icon}</div>
      <h3 className="font-display text-2xl text-primary">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <span className="mt-6 inline-flex rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
        {cta}
      </span>
    </Link>
  );
}
