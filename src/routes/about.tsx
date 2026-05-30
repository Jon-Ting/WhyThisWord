import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Why This Word" },
      {
        name: "description",
        content:
          "What Why This Word is — and what it deliberately is not. A study companion for contrastive semantics in the Greek New Testament.",
      },
      { property: "og:title", content: "About — Why This Word" },
      {
        property: "og:description",
        content: "A scholarly study companion, not a devotional or dogmatic engine.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-serif text-4xl leading-tight tracking-tight text-foreground">About</h1>
        <div className="mt-8 space-y-6 font-serif text-[17px] leading-relaxed text-reader-ink">
          <p>
            Why This Word is a reading companion for serious Bible students, seminarians, pastors,
            and theologically curious readers. It is built around one question:
            <em>
              {" "}
              why might the biblical author have chosen this word instead of a nearby alternative?
            </em>
          </p>
          <p>
            The interface is intentionally quiet. Pick a verse, click a Greek word, and a side panel
            opens with the lexical entry, a curated set of semantic neighbours, and a short
            reflection on what nuance would shift if one neighbour stood in for the chosen word.
          </p>
          <h2 className="pt-4 font-serif text-2xl text-foreground">What this is not</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Not an interlinear; the goal is comparison, not gloss-by-gloss decoding.</li>
            <li>
              Not a standard lexicon; entries are kept short and read for contrast rather than
              completeness.
            </li>
            <li>
              Not a devotional or a dogmatic engine. The tone is that of a careful seminary tutor:
              hedged, comparative, never certain about the author's mind.
            </li>
          </ul>
          <h2 className="pt-4 font-serif text-2xl text-foreground">Prototype scope</h2>
          <p>
            This is an MVP. The Greek text and contrastive notes are a curated mock dataset covering
            a handful of passages (John 1:1, John 21:15–17, Romans 3:21–26, Ephesians 2:8–9, Matthew
            5:3). The data layer is modular: real sources such as SBLGNT, MorphGNT, Strong's, and
            AI-generated explanations can later be plugged in behind the same component surface.
          </p>
          <div className="pt-4">
            <Link
              to="/reader/john-1"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Open the reader →
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
