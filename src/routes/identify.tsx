import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Leaf, Loader2, Upload, AlertTriangle, Sparkles, MapPin, Sun, FlaskConical, BookOpen, CheckCircle2 } from "lucide-react";
import { identifyPlant, type PlantDetail } from "@/lib/ayurveda.functions";

export const Route = createFileRoute("/identify")({ component: IdentifyPage });

function IdentifyPage() {
  const identify = useServerFn(identifyPlant);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlantDetail | null>(null);

  const onFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(f);
  };

  const onIdentify = async () => {
    if (!imageDataUrl) return;
    setLoading(true);
    setError(null);
    try {
      const r = await identify({ data: { imageDataUrl } });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Identification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to options
      </Link>
      <h1 className="mt-3 font-display text-5xl text-primary">Identify Medicinal Plant</h1>
      <p className="mt-2 text-foreground/75">Upload a plant image to discover its Ayurvedic benefits using AI</p>

      <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
        {!imageDataUrl ? (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background/40 p-12 text-center hover:bg-background/70">
            <Upload className="h-10 w-10 text-leaf" />
            <p className="mt-3 font-medium">Click to upload a plant image</p>
            <p className="text-xs text-muted-foreground">JPG / PNG · clear photo of leaves works best</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>
        ) : (
          <>
            <img src={imageDataUrl} alt="Plant" className="mx-auto max-h-80 rounded-xl object-contain" />
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <label className="cursor-pointer rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-secondary">
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                />
              </label>
              <button
                onClick={onIdentify}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Leaf className="h-4 w-4" />}
                {loading ? "Analyzing with AI…" : "Identify Plant and its Benefits"}
              </button>
            </div>
          </>
        )}
        {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
      </div>

      {result && <ResultCard r={result} />}
    </div>
  );
}

function Pill({ children, color = "secondary" }: { children: React.ReactNode; color?: "secondary" | "rose" | "saffron" }) {
  const cls =
    color === "rose"
      ? "bg-[color:var(--rose)]/15 text-[color:var(--rose)]"
      : color === "saffron"
        ? "bg-[color:var(--saffron)]/15 text-[color:var(--saffron)]"
        : "bg-secondary text-secondary-foreground";
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${cls}`}>{children}</span>;
}

function ResultCard({ r }: { r: PlantDetail }) {
  return (
    <div className="mt-8 space-y-6 animate-fade-up">
      {r.matched && (
        <div className="rounded-2xl border border-leaf/30 bg-leaf/10 px-4 py-3 text-sm text-primary">
          <CheckCircle2 className="mr-2 inline h-4 w-4" /> Verified match from medicinal herbs...
        </div>
      )}

      <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-primary">{r.name}</h2>
            {r.scientific_name && <p className="text-sm italic text-muted-foreground">{r.scientific_name}</p>}
            {r.family && <p className="text-xs text-muted-foreground">Family: {r.family}</p>}
            {r.preview && <p className="mt-3 text-sm text-foreground/80">{r.preview}</p>}
          </div>
          <Pill color="secondary">{r.confidence}% confidence</Pill>
        </div>

      </div>

      {r.conditions.length > 0 && (
        <Section icon={<BookOpen className="h-5 w-5" />} title="Conditions This Plant Treats (from Database)">
          <div className="space-y-3">
            {r.conditions.map((c, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-background/50 p-3">
                <p className="font-semibold text-primary">{c.name}</p>
                {c.symptoms && <p className="text-xs text-muted-foreground">Symptoms: {c.symptoms}</p>}
                {c.remedy && <p className="mt-1 text-sm">🌿 {c.remedy}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {r.benefits.length > 0 && (
          <Section icon={<Leaf className="h-5 w-5 text-leaf" />} title="Health Benefits">
            <ul className="space-y-1.5 text-sm">{r.benefits.map((b, i) => <li key={i}>• {b}</li>)}</ul>
          </Section>
        )}
        {r.remedies.length > 0 && (
          <Section icon={<FlaskConical className="h-5 w-5 text-saffron" />} title="Safe Home Remedies">
            <ul className="space-y-1.5 text-sm">{r.remedies.map((b, i) => <li key={i}>• {b}</li>)}</ul>
          </Section>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {r.climate && (
          <Section icon={<Sun className="h-5 w-5 text-saffron" />} title="Climate Suitability">
            <p className="text-sm">{r.climate}</p>
          </Section>
        )}
        {r.regional_availability && (
          <Section icon={<MapPin className="h-5 w-5 text-rose" />} title="Regional Availability">
            <p className="text-sm">{r.regional_availability}</p>
          </Section>
        )}
      </div>

      {r.precautions.length > 0 && (
        <div className="rounded-2xl border border-rose/40 bg-rose/5 p-5">
          <h4 className="mb-2 font-display text-rose"><AlertTriangle className="mr-1 inline h-4 w-4" /> Precautions</h4>
          <ul className="space-y-1 text-sm">{r.precautions.map((p, i) => <li key={i}>• {p}</li>)}</ul>
        </div>
      )}

      {r.traditional_uses && (
        <Section icon={<BookOpen className="h-5 w-5 text-saffron" />} title="Traditional Ayurvedic Uses">
          <p className="text-sm">{r.traditional_uses}</p>
        </Section>
      )}

      {r.alternative_plants.length > 0 && (
        <Section icon={<Leaf className="h-5 w-5 text-leaf" />} title="Alternative Plants">
          <div className="flex flex-wrap gap-2">{r.alternative_plants.map((a) => <Pill key={a}>{a}</Pill>)}</div>
        </Section>
      )}

      {(r.ai_explanation || r.key_features.length > 0) && (
        <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-sm">
          <h3 className="font-display text-xl text-primary">🌸 AI Analysis Explanation</h3>
          {r.ai_explanation && <p className="mt-3 text-sm text-foreground/85">{r.ai_explanation}</p>}
          {r.key_features.length > 0 && (
            <>
              <p className="mt-4 text-sm font-semibold text-saffron">Key Features Detected</p>
              <div className="mt-2 flex flex-wrap gap-2">{r.key_features.map((k, i) => <Pill key={i}>{k}</Pill>)}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex gap-2"><dt className="font-semibold text-primary">{label}:</dt><dd>{v}</dd></div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 font-display text-xl text-primary">{icon}{title}</h3>
      {children}
    </div>
  );
}
