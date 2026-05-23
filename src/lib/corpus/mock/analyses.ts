import type { WordAnalysis } from "../types";

// Curated mock analyses. Tone: hedged, comparative, never dogmatic.
// Phrases to favour: "may suggest", "can imply", "often associated with",
// "possibly emphasises". Avoid: "the author definitely meant", overclaims.

export const analyses: Record<string, WordAnalysis> = {
  λόγος: {
    lemma: "λόγος",
    translit: "logos",
    pronunciation: "/ˈloɡos/",
    morphSummary: "Masculine noun, 2nd declension.",
    glosses: ["word", "reason", "discourse", "account"],
    shortDef:
      "A reasoned utterance: not merely a sound but speech bound up with thought, account, and ordering reason. In John 1:1 it carries strong philosophical and Jewish-wisdom resonance.",
    neighbours: [
      {
        lemma: "ῥῆμα",
        translit: "rhēma",
        overlap: "Both can be translated 'word' in English.",
        distinction:
          "ῥῆμα tends to denote a specific utterance or saying — a word as spoken, in a moment. λόγος leans toward word-as-message, word-as-reasoning, the structured content.",
        typicalUsage:
          "ῥῆμα often appears for a particular pronouncement (e.g. Luke 2:29 'according to your ῥῆμα'). λόγος dominates contexts of teaching, discourse, and accounting.",
        implication:
          "Choosing λόγος rather than ῥῆμα may suggest John is not pointing to a single saying but to the comprehensive self-expression of God.",
        ifReplaced:
          "If John had written 'In the beginning was the ῥῆμα,' the verse might feel more like a reference to a particular divine saying — closer to Genesis 1's spoken commands — and less like an evocation of an enduring, structured divine reason.",
      },
      {
        lemma: "σοφία",
        translit: "sophia",
        overlap:
          "Both λόγος and σοφία participate in Jewish wisdom traditions where a divine attribute is personified as present at creation (cf. Prov. 8).",
        distinction:
          "σοφία foregrounds insight, skill, the contemplative quality of wisdom. λόγος foregrounds expression, articulation, account.",
        typicalUsage:
          "σοφία is the natural choice in sapiential literature; λόγος is more at home in legal, philosophical, and rhetorical contexts.",
        implication:
          "Using λόγος rather than σοφία possibly emphasises God's self-communication and intelligibility, not only God's depth of wisdom.",
        ifReplaced:
          "Replacing λόγος with σοφία would tilt the prologue toward a contemplative-wisdom register, weakening the note of speech, address, and revelation that λόγος carries.",
      },
      {
        lemma: "φωνή",
        translit: "phōnē",
        overlap: "Both can refer to vocal speech.",
        distinction:
          "φωνή is the sound itself — a voice, a cry, a noise that may or may not carry articulated meaning. λόγος is the meaning-bearing structure.",
        typicalUsage:
          "φωνή is used for John the Baptist's self-description as 'a voice crying' (John 1:23). λόγος is reserved for the subject of the prologue.",
        implication:
          "The contrast between φωνή (the Baptist) and λόγος (Christ) later in chapter 1 may be deliberate: a voice points to a Word.",
        ifReplaced:
          "If φωνή stood in place of λόγος, the prologue would emphasise audible presence at the cost of articulated meaning, and the Baptist/Christ contrast would collapse.",
      },
      {
        lemma: "νόμος",
        translit: "nomos",
        overlap:
          "Both λόγος and νόμος can name an ordering principle that comes from God and shapes life.",
        distinction:
          "νόμος is law — codified, normative, often Mosaic. λόγος is broader: rational structure, expression, account.",
        typicalUsage:
          "νόμος dominates Paul; λόγος dominates John's prologue.",
          implication:
          "Opening with λόγος rather than νόμος may suggest John frames revelation in terms of personal self-disclosure rather than legal code — a contrast he develops in 1:17 ('the law was given through Moses; grace and truth came through Jesus Christ').",
        ifReplaced:
          "Substituting νόμος would re-cast Christ as embodied Torah, a legitimate biblical theme, but would lose the philosophical and creational reach of λόγος.",
      },
    ],
    examples: [
      {
        ref: "John 1:14",
        englishSnippet: "And the Word became flesh and dwelt among us.",
        greekSnippet: "καὶ ὁ Λόγος σὰρξ ἐγένετο",
        highlightLemma: "λόγος",
      }, // appease TS shape
      {
        ref: "Hebrews 4:12",
        englishSnippet: "For the word of God is living and active.",
        greekSnippet: "ζῶν γὰρ ὁ λόγος τοῦ Θεοῦ",
        highlightLemma: "λόγος",
      },
      {
        ref: "Luke 1:38 (ῥῆμα)",
        englishSnippet: "Let it be to me according to your word.",
        greekSnippet: "γένοιτό μοι κατὰ τὸ ῥῆμά σου",
        highlightLemma: "ῥῆμα",
        note: "Mary's response uses ῥῆμα — a specific spoken promise — not λόγος.",
      },
    ],
  },

  θεός: {
    lemma: "θεός",
    translit: "theos",
    pronunciation: "/tʰeˈos/",
    morphSummary: "Masculine noun, 2nd declension.",
    glosses: ["God", "god", "deity"],
    shortDef:
      "The general Greek term for deity. In the NT, almost always used of the God of Israel; in John 1:1 it appears both with and without the article, a distinction much discussed.",
    neighbours: [
      {
        lemma: "κύριος",
        translit: "kyrios",
        overlap: "Both can refer to the God of Israel.",
        distinction:
          "κύριος ('lord/master') foregrounds authority and relational standing; θεός foregrounds divine nature itself. In the LXX, κύριος often renders the divine name YHWH.",
        typicalUsage:
          "Confessions like 'Jesus is κύριος' (Rom. 10:9) place the weight on lordship; ontological statements typically reach for θεός.",
        implication:
          "John 1:1c using θεός (not κύριος) may suggest the claim is about the Word's nature, not only the Word's authority.",
        ifReplaced:
          "Replacing θεός with κύριος would shift the verse from a statement about what the Word is to a statement about the Word's rank or rule.",
      },
      {
        lemma: "πατήρ",
        translit: "patēr",
        overlap: "Both can name the first person of the Godhead in NT usage.",
        distinction:
          "πατήρ specifies relation (to the Son, to believers). θεός does not specify relation.",
        typicalUsage:
          "John uses πατήρ heavily for the Father in relation to the Son. θεός in 1:1 sits before that relational vocabulary is unfolded.",
        implication:
          "Beginning with θεός rather than πατήρ may keep the prologue's opening claim deliberately general before relational distinctions are introduced.",
        ifReplaced:
          "Opening with πατήρ would already presuppose the Son/Father pairing that the prologue is in the process of disclosing.",
      },
    ],
    examples: [
      {
        ref: "John 20:28",
        englishSnippet: "My Lord and my God!",
        greekSnippet: "Ὁ κύριός μου καὶ ὁ Θεός μου",
        highlightLemma: "θεός",
      },
    ],
  },

  ἀρχή: {
    lemma: "ἀρχή",
    translit: "archē",
    pronunciation: "/arˈkʰɛː/",
    morphSummary: "Feminine noun, 1st declension.",
    glosses: ["beginning", "origin", "rule", "first principle"],
    shortDef:
      "Both a temporal beginning and a principle of origin or rule. Echoes Genesis 1:1 LXX ('Ἐν ἀρχῇ ἐποίησεν ὁ Θεός').",
    neighbours: [
      {
        lemma: "γένεσις",
        translit: "genesis",
        overlap: "Both can mark the inception of something.",
        distinction:
          "γένεσις names a coming-into-being; ἀρχή names the originating point or principle.",
        typicalUsage:
          "Matthew 1:1 uses βίβλος γενέσεως ('book of the genesis') for Jesus' lineage; John reaches for ἀρχή to evoke creation itself.",
        implication:
          "Choosing ἀρχή rather than γένεσις can imply that the Word is not coming-into-being but is already there at the originating point.",
        ifReplaced:
          "'In the γένεσις was the Word' would suggest the Word also began — a different theology from the one John seems to be constructing.",
      },
      {
        lemma: "πρῶτον",
        translit: "prōton",
        overlap: "Both can mark priority.",
        distinction:
          "πρῶτον is ordinal ('first in sequence'); ἀρχή carries a heavier ontological weight ('originating principle').",
        typicalUsage:
          "πρῶτον commonly orders events or items; ἀρχή frames cosmologies.",
        implication:
          "ἀρχή places the prologue in a cosmological register rather than a chronological list.",
        ifReplaced:
          "Replacing ἀρχή with πρῶτον would flatten the verse into sequence: 'first, there was the Word' — a temporal note rather than an originating claim.",
      },
    ],
    examples: [
      {
        ref: "Genesis 1:1 (LXX)",
        englishSnippet: "In the beginning God created the heavens and the earth.",
        greekSnippet: "Ἐν ἀρχῇ ἐποίησεν ὁ Θεὸς",
        highlightLemma: "ἀρχή",
      },
      {
        ref: "Colossians 1:18",
        englishSnippet: "He is the beginning, the firstborn from the dead.",
        greekSnippet: "ὅς ἐστιν ἀρχή",
        highlightLemma: "ἀρχή",
      },
    ],
  },

  πρός: {
    lemma: "πρός",
    translit: "pros",
    pronunciation: "/pros/",
    morphSummary: "Preposition; with accusative here.",
    glosses: ["toward", "with", "facing", "in relation to"],
    shortDef:
      "A preposition of orientation. With the accusative it often suggests movement toward, presence-with, or face-to-face relation rather than mere co-location.",
    neighbours: [
      {
        lemma: "μετά",
        translit: "meta",
        overlap: "Both can be rendered 'with' in English.",
        distinction:
          "μετά + genitive typically denotes accompaniment ('along with'). πρός + accusative often suggests directedness, an oriented relation.",
        typicalUsage:
          "μετά is the natural choice for being-alongside ('he was with them'). πρός is striking in 1:1 because it implies a face-toward-face posture.",
        implication:
          "Using πρός rather than μετά can imply a relational vector between the Word and God, not merely co-presence.",
        ifReplaced:
          "'The Word was μετὰ τὸν Θεόν' would flatten the relation to companionship; πρός suggests something more deliberately oriented.",
      },
      {
        lemma: "σύν",
        translit: "syn",
        overlap: "'With' in the sense of together.",
        distinction:
          "σύν emphasises union or shared participation; πρός emphasises orientation toward.",
        typicalUsage:
          "σύν is common in Paul for incorporation ('with Christ'). πρός in John 1:1 keeps the two as distinguishable yet related.",
        implication:
          "πρός can imply distinguishable persons in relation; σύν would tilt the verse toward fused union.",
        ifReplaced:
          "Replacing πρός with σύν might collapse the careful distinguishability the prologue maintains.",
      },
      {
        lemma: "παρά",
        translit: "para",
        overlap: "'Beside' or 'with'.",
        distinction:
          "παρά + dative denotes being beside or in someone's presence; πρός + accusative carries the sense of directed relation.",
        typicalUsage:
          "παρά often locates someone at a place or with a person spatially. πρός is more dynamic.",
        implication:
          "πρός can imply active facing-toward; παρά would suggest static co-location.",
        ifReplaced:
          "παρά would render the verse closer to 'the Word was beside God' — a quieter, less relationally charged image.",
      },
    ],
    examples: [
      {
        ref: "1 John 1:2",
        englishSnippet: "the eternal life that was with the Father.",
        greekSnippet: "ἥτις ἦν πρὸς τὸν Πατέρα",
        highlightLemma: "πρός",
      },
    ],
  },

  ἀγαπάω: {
    lemma: "ἀγαπάω",
    translit: "agapaō",
    pronunciation: "/aɡaˈpao/",
    morphSummary: "Verb, alpha-contract.",
    glosses: ["to love (with committed regard)"],
    shortDef:
      "Often associated with willed, principled love — though the lexical distinction from φιλέω is less rigid in Koine than older commentaries claimed.",
    neighbours: [
      {
        lemma: "φιλέω",
        translit: "phileō",
        overlap:
          "Both verbs are used for love between God and humans, parents and children, and friends. In Koine they overlap substantially.",
        distinction:
          "ἀγαπάω is often associated with deliberate, principled love. φιλέω can carry affectionate, friendship-bound warmth. The contrast is real in some texts but easily overstated.",
        typicalUsage:
          "John 21:15–17 alternates the two verbs, which has prompted long-standing discussion: deliberate distinction, or stylistic variation?",
        implication:
          "Readers should hold both options carefully — a meaningful contrast is possible, but so is synonymy. Modern scholarship is divided.",
        ifReplaced:
          "If Jesus had used φιλέω throughout, or Peter ἀγαπάω throughout, the famous exchange would feel less textured; whether that texture is theologically loaded or stylistic is itself the question.",
      },
      {
        lemma: "στοργή",
        translit: "storgē",
        overlap: "All three name forms of love.",
        distinction:
          "στοργή is familial affection; ἀγαπάω names a broader, often willed, regard.",
        typicalUsage:
          "στοργή is rare in the NT; ἀγαπάω dominates.",
        implication:
          "The NT's preference for ἀγαπάω over στοργή may suggest love framed less by kinship instinct and more by chosen commitment.",
        ifReplaced:
          "Substituting στοργή would narrow the scope to familial bond and lose the volitional reach of ἀγαπάω.",
      },
    ],
    examples: [
      {
        ref: "John 3:16",
        englishSnippet: "For God so loved the world…",
        greekSnippet: "οὕτως γὰρ ἠγάπησεν ὁ Θεὸς τὸν κόσμον",
        highlightLemma: "ἀγαπάω",
      },
    ],
  },

  φιλέω: {
    lemma: "φιλέω",
    translit: "phileō",
    pronunciation: "/pʰiˈleo/",
    morphSummary: "Verb, epsilon-contract.",
    glosses: ["to love (with affectionate attachment)", "to kiss"],
    shortDef:
      "Frequently associated with the warmth of friendship and affection. Overlaps heavily with ἀγαπάω in Koine.",
    neighbours: [
      {
        lemma: "ἀγαπάω",
        translit: "agapaō",
        overlap:
          "Both verbs name love and are at points interchangeable in Koine.",
        distinction:
          "φιλέω often carries affective warmth; ἀγαπάω often carries willed regard. The contrast is genuine in some texts but should not be pressed into a rigid system.",
        typicalUsage:
          "John 21 places the two side by side, inviting comparison without forcing a verdict.",
        implication:
          "Peter's response with φιλέω after Jesus' ἀγαπᾷς may suggest reluctance to claim the stronger term, or may simply reflect Johannine stylistic variation.",
        ifReplaced:
          "If Peter had matched Jesus' verb in each round, the dialogue would lose the asymmetry that has fed centuries of interpretation.",
      },
    ],
    examples: [
      {
        ref: "John 11:36",
        englishSnippet: "See how he loved him!",
        greekSnippet: "Ἴδε πῶς ἐφίλει αὐτόν",
        highlightLemma: "φιλέω",
      },
    ],
  },

  πίστις: {
    lemma: "πίστις",
    translit: "pistis",
    pronunciation: "/ˈpistis/",
    morphSummary: "Feminine noun, 3rd declension.",
    glosses: ["faith", "trust", "faithfulness", "fidelity"],
    shortDef:
      "Spans cognitive trust, relational fidelity, and the body of what is believed. In Paul, debate continues over 'faith in Christ' vs. 'faithfulness of Christ' (the πίστις Χριστοῦ debate).",
    neighbours: [
      {
        lemma: "ἐλπίς",
        translit: "elpis",
        overlap: "Both lean into a forward-leaning stance toward God's promises.",
        distinction:
          "ἐλπίς is hope, oriented to the not-yet. πίστις rests on what is given as trustworthy.",
        typicalUsage: "Paul triads πίστις, ἐλπίς, ἀγάπη (1 Cor 13).",
        implication:
          "Using πίστις rather than ἐλπίς in Rom 3:22 keeps the emphasis on trust in what God has done, not on what is hoped for.",
        ifReplaced:
          "Substituting ἐλπίς would shift the verse's centre of gravity from received righteousness to anticipated outcome.",
      },
      {
        lemma: "γνῶσις",
        translit: "gnōsis",
        overlap: "Both can describe a kind of grasp on what is true.",
        distinction:
          "γνῶσις is knowledge; πίστις is trust. Trust may rest on knowledge but is not reducible to it.",
        typicalUsage:
          "γνῶσις became loaded in second-century Christian debates; in Paul, πίστις is the operative term for relating to God in Christ.",
        implication:
          "Choosing πίστις rather than γνῶσις places relationship and trust prior to comprehension.",
        ifReplaced:
          "Replacing πίστις with γνῶσις would risk re-framing salvation as cognitive achievement.",
      },
    ],
    examples: [
      {
        ref: "Galatians 2:16",
        englishSnippet: "justified… through faith in Jesus Christ.",
        greekSnippet: "διὰ πίστεως Ἰησοῦ Χριστοῦ",
        highlightLemma: "πίστις",
      },
    ],
  },

  δικαιοσύνη: {
    lemma: "δικαιοσύνη",
    translit: "dikaiosynē",
    pronunciation: "/dikaioˈsynɛː/",
    morphSummary: "Feminine noun, 1st declension.",
    glosses: ["righteousness", "justice", "uprightness"],
    shortDef:
      "Names both a relational standing (being in the right) and a quality (being upright/just). The English split between 'righteousness' and 'justice' is one word in Greek.",
    neighbours: [
      {
        lemma: "κρίσις",
        translit: "krisis",
        overlap: "Both belong to the semantic field of justice.",
        distinction:
          "κρίσις names the act or process of judging. δικαιοσύνη names the state of being in the right.",
        typicalUsage:
          "κρίσις dominates eschatological judgement passages; δικαιοσύνη dominates Pauline soteriology.",
        implication:
          "Romans foregrounds δικαιοσύνη — gift and standing — over κρίσις — verdict-as-event.",
        ifReplaced:
          "Substituting κρίσις in Rom 3:22 would make the verse about the act of judgement rather than the standing conferred.",
      },
      {
        lemma: "ἁγιωσύνη",
        translit: "hagiōsynē",
        overlap:
          "Both name a quality God shares with those joined to him.",
        distinction:
          "ἁγιωσύνη is holiness — set-apartness. δικαιοσύνη is rightness — relational/forensic alignment.",
        typicalUsage:
          "Paul uses both; in Romans 3, δικαιοσύνη carries the argument.",
        implication:
          "Choosing δικαιοσύνη here keeps the focus on standing-before-God rather than purity.",
        ifReplaced:
          "Replacing with ἁγιωσύνη would reframe the verse around purification rather than acquittal.",
      },
    ],
    examples: [
      {
        ref: "Matthew 6:33",
        englishSnippet: "Seek first the kingdom and his righteousness.",
        greekSnippet: "τὴν δικαιοσύνην αὐτοῦ",
        highlightLemma: "δικαιοσύνη",
      },
    ],
  },

  χάρις: {
    lemma: "χάρις",
    translit: "charis",
    pronunciation: "/ˈkʰaris/",
    morphSummary: "Feminine noun, 3rd declension.",
    glosses: ["grace", "favor", "gift", "kindness", "gratitude"],
    shortDef:
      "Names the disposition of favor and the gift that flows from it. In the Greco-Roman world, χάρις structured patronage; Paul re-tunes it around unearned divine generosity.",
    neighbours: [
      {
        lemma: "ἔλεος",
        translit: "eleos",
        overlap: "Both name God's kindness.",
        distinction:
          "ἔλεος is mercy — kindness toward the miserable. χάρις is favor — kindness as gift.",
        typicalUsage:
          "ἔλεος carries forward LXX vocabulary for חֶסֶד (covenant loyalty). χάρις dominates Paul's articulation of salvation.",
        implication:
          "Using χάρις rather than ἔλεος in Eph 2:8 highlights gift, not just relief.",
        ifReplaced:
          "Replacing χάρις with ἔλεος would foreground rescue from misery and underplay the note of free gift.",
      },
      {
        lemma: "δῶρον",
        translit: "dōron",
        overlap: "Both belong to the gift field.",
        distinction:
          "δῶρον is the gift-object; χάρις is the gracious disposition that gives it.",
        typicalUsage:
          "Eph 2:8 actually uses both — 'by χάρις… it is the δῶρον of God.'",
        implication:
          "Paul stacks the two so the disposition and the gift reinforce one another.",
        ifReplaced:
          "Using only δῶρον would lose the relational warmth of χάρις; using only χάρις would lose the concreteness of δῶρον.",
      },
    ],
    examples: [
      {
        ref: "Romans 5:15",
        englishSnippet: "much more have the grace of God… abounded for many.",
        greekSnippet: "ἡ χάρις τοῦ Θεοῦ",
        highlightLemma: "χάρις",
      },
    ],
  },

  μακάριος: {
    lemma: "μακάριος",
    translit: "makarios",
    pronunciation: "/maˈkarios/",
    morphSummary: "Adjective, 2nd–1st declension.",
    glosses: ["blessed", "fortunate", "happy"],
    shortDef:
      "Often translated 'blessed'. Sits between 'happy' and 'enviably well-off in God's sight'. English 'blessed' can sound passive; μακάριος is more a recognition of state than a wish.",
    neighbours: [
      {
        lemma: "εὐλογητός",
        translit: "eulogētos",
        overlap: "Both can be rendered 'blessed' in English.",
        distinction:
          "εὐλογητός means 'praised, spoken-well-of' and in NT usage is reserved almost entirely for God. μακάριος describes humans (and occasionally God) as enviably well-positioned.",
        typicalUsage:
          "Doxologies use εὐλογητός ('Blessed be God'). Beatitudes use μακάριος.",
        implication:
          "Jesus' choice of μακάριος in the Beatitudes can imply a declaration about the recipients' actual state, not merely a wish or a praise.",
        ifReplaced:
          "Replacing μακάριος with εὐλογητός would turn the Beatitudes into doxologies about the poor rather than declarations over them.",
      },
      {
        lemma: "εὐδαίμων",
        translit: "eudaimōn",
        overlap: "Both touch the field of human flourishing.",
        distinction:
          "εὐδαίμων is the classical philosophical term for the well-flourishing life; μακάριος in NT usage attaches flourishing to God's reign.",
        typicalUsage:
          "εὐδαίμων is rare in the NT; μακάριος is the gospel idiom.",
        implication:
          "Using μακάριος rather than εὐδαίμων can imply that the blessedness in view is not philosophical self-cultivation but God-given standing.",
        ifReplaced:
          "εὐδαίμων would re-root the Beatitudes in classical ethics rather than in the inbreaking kingdom.",
      },
    ],
    examples: [
      {
        ref: "Matthew 5:8",
        englishSnippet: "Blessed are the pure in heart.",
        greekSnippet: "Μακάριοι οἱ καθαροὶ τῇ καρδίᾳ",
        highlightLemma: "μακάριος",
      },
    ],
  },

  πτωχός: {
    lemma: "πτωχός",
    translit: "ptōchos",
    pronunciation: "/ptɔˈkʰos/",
    morphSummary: "Adjective, 2nd–1st declension.",
    glosses: ["poor", "destitute", "beggarly"],
    shortDef:
      "Names the destitute — one who crouches and begs — not merely the modestly poor. The choice over πένης is striking.",
    neighbours: [
      {
        lemma: "πένης",
        translit: "penēs",
        overlap: "Both denote economic poverty.",
        distinction:
          "πένης is the working poor — one who labours for daily bread. πτωχός is the absolutely destitute — one who has nothing and must beg.",
        typicalUsage:
          "Classical Greek distinguishes them sharply; the NT prefers πτωχός in beatitude contexts.",
        implication:
          "Choosing πτωχός rather than πένης can imply that the Beatitude addresses those at the very bottom, not the merely modest.",
        ifReplaced:
          "πένης would soften the Beatitude into a blessing on the working poor; πτωχός keeps the edge of total dependence.",
      },
      {
        lemma: "ταπεινός",
        translit: "tapeinos",
        overlap: "Both can name a low or humbled condition.",
        distinction:
          "ταπεινός is lowly or humble — a posture. πτωχός is destitute — a material condition often spiritualised in 'poor in spirit'.",
        typicalUsage:
          "ταπεινός is used of Mary in the Magnificat ('my lowly state').",
        implication:
          "Matthew's πτωχοὶ τῷ πνεύματι may suggest spiritual destitution — empty hands before God — rather than the virtue of humility per se.",
        ifReplaced:
          "ταπεινοί would foreground the virtue of humility; πτωχοί foregrounds the recognition of empty-handedness.",
      },
    ],
    examples: [
      {
        ref: "Luke 6:20",
        englishSnippet: "Blessed are you who are poor.",
        greekSnippet: "Μακάριοι οἱ πτωχοί",
        highlightLemma: "πτωχός",
      },
    ],
  },
};
