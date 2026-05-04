import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Sparkles, AlertTriangle, Activity, Salad, Flower2 } from "lucide-react";
import { findRemedies, type RemedyMatch } from "@/lib/ayurveda.functions";

export const Route = createFileRoute("/remedy")({ component: RemedyPage });

function RemedyPage() {
  const find = useServerFn(findRemedies);
  const [symptoms, setSymptoms] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ diet_lifestyle: string; yoga_therapy: string; results: RemedyMatch[] } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await find({ data: { symptoms, location: location || undefined } });
      setData(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to options
      </Link>
      <h1 className="mt-3 font-display text-5xl text-primary">Find Ayurvedic Remedy</h1>
      <p className="mt-2 text-foreground/75">Enter your symptoms for AI-powered personalized Ayurvedic recommendations.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium">Symptoms / Disease</label>
          <input
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. Fever, Fatigue"
            className="mt-1 w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Location (optional — for regional plant availability)</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Hyderabad"
            className="mt-1 w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !symptoms.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Analyzing Suitable Remedies ...." : "Check Remedies"}
        </button>
        {error && <p className="text-center text-sm text-destructive">{error}</p>}
      </form>

      {data && (
        <div className="mt-8 space-y-6 animate-fade-up">
          {data.results.map((r, i) => (
            <RemedyCard key={i} r={r} />
          ))}
          {data.results.length === 0 && (
            <p className="text-center text-muted-foreground">No matching plants found. Try refining symptoms.</p>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {data.diet_lifestyle && (
              <Block icon={<Salad className="h-5 w-5 text-saffron" />} title="Diet & Lifestyle" body={data.diet_lifestyle} />
            )}
            {data.yoga_therapy && (
              <Block icon={<Flower2 className="h-5 w-5 text-saffron" />} title="Yoga & Therapy" body={data.yoga_therapy} />
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card px-5 py-3 text-center text-sm text-muted-foreground">
            🪔 Always consult a qualified Ayurvedic practitioner. This is for educational purposes only.
          </div>
        </div>
      )}
    </div>
  );
}

function RemedyCard({ r }: { r: RemedyMatch }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl text-primary">{r.plant_name}</h3>
          {r.scientific_name && <p className="text-xs italic text-muted-foreground">{r.scientific_name}</p>}
        </div>
        <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {r.match_pct}% match
        </span>
      </div>

      <Row icon="🌸" label="Why Recommended" text={r.why_recommended} />
      <Row icon={<Activity className="inline h-4 w-4 text-saffron" />} label="How It Works" text={r.how_it_works} />
      <Row icon="🕉" label="Effect on the Body" text={r.dosha_effect} />
      <Row icon="🌿" label="Safe Home Remedy" text={r.safe_home_remedy} />

      <div className="mt-4 rounded-2xl border border-rose/30 bg-rose/5 p-4 text-sm">
        <p className="mb-1 font-display text-rose"><AlertTriangle className="mr-1 inline h-4 w-4" /> Precautions</p>
        <p>{r.precautions}</p>
      </div>
    </div>
  );
}

function Row({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <div className="mt-4">
      <p className="text-sm font-display text-saffron">{icon} {label}</p>
      <p className="mt-1 text-sm text-foreground/85">{text}</p>
    </div>
  );
}

function Block({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
      <h3 className="mb-2 flex items-center gap-2 font-display text-xl text-saffron">{icon}{title}</h3>
      <p className="text-sm text-foreground/85">{body}</p>
    </div>
  );
}
