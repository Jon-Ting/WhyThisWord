import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import logoLight from "../../assets/logos/primary-light.png";
import logoDark from "../../assets/logos/primary-dark.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Why This Word" },
      {
        name: "description",
        content:
          "A contrastive-semantics reader for the Greek New Testament. Explore why biblical authors chose this word, not a nearby alternative.",
      },
      { property: "og:title", content: "Why This Word" },
      {
        property: "og:description",
        content:
          "Click any Greek word to see its semantic neighbours and what shifts when one is swapped for another.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-3xl px-6 pt-16 pb-16 text-center">
          <div className="mx-auto mb-10 flex justify-center">
            <img src={logoLight} alt="Why This Word" className="h-20 w-auto object-contain dark:hidden" />
            <img src={logoDark} alt="Why This Word" className="hidden h-20 w-auto object-contain dark:block" />
          </div>
          <p className="font-greek text-sm uppercase tracking-[0.3em] text-accent-scholar">
            λόγος · ῥῆμα · σοφία · φωνή
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Why <em className="not-italic text-accent-scholar">this</em> word,
            <br />
            and not a near one?
          </h1>
          <p className="mx-auto mt-7 max-w-xl font-serif text-lg leading-relaxed text-muted-foreground">
            A reading companion for the Greek New Testament. Click any word to surface its
            lexical entry, its semantic neighbours, and a careful reflection on what would
            shift if the author had reached for a different term.
          </p>

          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              to="/reader/john-1"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open the reader · John 1:1
            </Link>
            <Link
              to="/about"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              What this is
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
            <Card
              title="Lexical, hedged"
              body="Lemma, morphology, glosses — paired with prose that prefers may, can, often associated with."
            />
            <Card
              title="Semantic neighbours"
              body="For each word, a curated handful of nearby Greek terms with overlap, distinction, and typical usage."
            />
            <Card
              title="What changes if replaced?"
              body="A short, italicised note on the nuance that would tilt in or out if the author had chosen a near-synonym."
            />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <blockquote className="border-l-2 border-accent-scholar pl-6 font-serif text-xl italic leading-relaxed text-reader-ink">
            “Biblical authors chose words carefully. Theology can hinge on a lexical
            distinction. Translation compresses meaning. Careful reading matters.”
          </blockquote>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-background p-7">
      <h3 className="font-serif text-lg text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
