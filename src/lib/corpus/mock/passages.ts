import type { Passage } from "../types";

// Token IDs follow the convention `{passageId}-{verseIdx}-{tokenIdx}`.
// Greek text is mock/simplified for prototype purposes — when wiring SBLGNT
// later, this mock module is the only file that needs to be replaced.

export const passages: Passage[] = [
  {
    id: "john-1",
    ref: "John 1:1",
    title: "The Word",
    description: "Prologue of John's Gospel — λόγος, ἀρχή, πρός, θεός.",
    verses: [
      {
        ref: "John 1:1",
        englishText:
          "In the beginning was the Word, and the Word was with God, and the Word was God.",
        tokens: [
          { id: "john-1-0-0", surface: "Ἐν", lemma: "ἐν", translit: "en", morph: "Prep", glosses: ["in", "within"] },
          { id: "john-1-0-1", surface: "ἀρχῇ", lemma: "ἀρχή", translit: "archē", morph: "Noun, dat. fem. sg.", glosses: ["beginning", "origin", "rule"] },
          { id: "john-1-0-2", surface: "ἦν", lemma: "εἰμί", translit: "ēn", morph: "Verb, impf. act. ind. 3sg.", glosses: ["was", "existed"] },
          { id: "john-1-0-3", surface: "ὁ", lemma: "ὁ", translit: "ho", morph: "Article, nom. masc. sg.", glosses: ["the"] },
          { id: "john-1-0-4", surface: "Λόγος", lemma: "λόγος", translit: "logos", morph: "Noun, nom. masc. sg.", glosses: ["word", "reason", "discourse"], punctuationAfter: "," },
          { id: "john-1-0-5", surface: "καὶ", lemma: "καί", translit: "kai", morph: "Conj.", glosses: ["and", "also"] },
          { id: "john-1-0-6", surface: "ὁ", lemma: "ὁ", translit: "ho", morph: "Article, nom. masc. sg.", glosses: ["the"] },
          { id: "john-1-0-7", surface: "Λόγος", lemma: "λόγος", translit: "logos", morph: "Noun, nom. masc. sg.", glosses: ["word", "reason", "discourse"] },
          { id: "john-1-0-8", surface: "ἦν", lemma: "εἰμί", translit: "ēn", morph: "Verb, impf. act. ind. 3sg.", glosses: ["was"] },
          { id: "john-1-0-9", surface: "πρὸς", lemma: "πρός", translit: "pros", morph: "Prep. + acc.", glosses: ["toward", "with", "facing"] },
          { id: "john-1-0-10", surface: "τὸν", lemma: "ὁ", translit: "ton", morph: "Article, acc. masc. sg.", glosses: ["the"] },
          { id: "john-1-0-11", surface: "Θεόν", lemma: "θεός", translit: "theon", morph: "Noun, acc. masc. sg.", glosses: ["God", "god"], punctuationAfter: "," },
          { id: "john-1-0-12", surface: "καὶ", lemma: "καί", translit: "kai", morph: "Conj.", glosses: ["and"] },
          { id: "john-1-0-13", surface: "Θεὸς", lemma: "θεός", translit: "theos", morph: "Noun, nom. masc. sg.", glosses: ["God"] },
          { id: "john-1-0-14", surface: "ἦν", lemma: "εἰμί", translit: "ēn", morph: "Verb, impf. act. ind. 3sg.", glosses: ["was"] },
          { id: "john-1-0-15", surface: "ὁ", lemma: "ὁ", translit: "ho", morph: "Article, nom. masc. sg.", glosses: ["the"] },
          { id: "john-1-0-16", surface: "Λόγος", lemma: "λόγος", translit: "logos", morph: "Noun, nom. masc. sg.", glosses: ["word"], punctuationAfter: "." },
        ],
      },
    ],
  },
  {
    id: "john-21",
    ref: "John 21:15–17",
    title: "Do you love me?",
    description: "The famous ἀγαπάω / φιλέω exchange between Jesus and Peter.",
    verses: [
      {
        ref: "John 21:15",
        englishText:
          "Simon son of John, do you love me more than these? — Yes, Lord; you know that I love you.",
        tokens: [
          { id: "john-21-0-0", surface: "Σίμων", lemma: "Σίμων", translit: "Simōn", morph: "Noun, voc. masc. sg.", glosses: ["Simon"] },
          { id: "john-21-0-1", surface: "Ἰωάννου", lemma: "Ἰωάννης", translit: "Iōannou", morph: "Noun, gen. masc. sg.", glosses: ["of John"], punctuationAfter: "," },
          { id: "john-21-0-2", surface: "ἀγαπᾷς", lemma: "ἀγαπάω", translit: "agapas", morph: "Verb, pres. act. ind. 2sg.", glosses: ["love (with committed will)"] },
          { id: "john-21-0-3", surface: "με", lemma: "ἐγώ", translit: "me", morph: "Pron., acc. 1sg.", glosses: ["me"] },
          { id: "john-21-0-4", surface: "πλέον", lemma: "πολύς", translit: "pleon", morph: "Adj., comp.", glosses: ["more"] },
          { id: "john-21-0-5", surface: "τούτων", lemma: "οὗτος", translit: "toutōn", morph: "Pron., gen. pl.", glosses: ["than these"], punctuationAfter: ";" },
          { id: "john-21-0-6", surface: "φιλῶ", lemma: "φιλέω", translit: "philō", morph: "Verb, pres. act. ind. 1sg.", glosses: ["love (with affection)"] },
          { id: "john-21-0-7", surface: "σε", lemma: "σύ", translit: "se", morph: "Pron., acc. 2sg.", glosses: ["you"], punctuationAfter: "." },
        ],
      },
    ],
  },
  {
    id: "romans-3",
    ref: "Romans 3:21–26",
    title: "Righteousness apart from law",
    description:
      "Dense Pauline vocabulary: δικαιοσύνη, πίστις, ἱλαστήριον, ἀπολύτρωσις.",
    verses: [
      {
        ref: "Romans 3:22",
        englishText:
          "the righteousness of God through faith in Jesus Christ, for all who believe.",
        tokens: [
          { id: "romans-3-0-0", surface: "δικαιοσύνη", lemma: "δικαιοσύνη", translit: "dikaiosynē", morph: "Noun, nom. fem. sg.", glosses: ["righteousness", "justice"] },
          { id: "romans-3-0-1", surface: "δὲ", lemma: "δέ", translit: "de", morph: "Conj.", glosses: ["but", "and"] },
          { id: "romans-3-0-2", surface: "Θεοῦ", lemma: "θεός", translit: "theou", morph: "Noun, gen. masc. sg.", glosses: ["of God"] },
          { id: "romans-3-0-3", surface: "διὰ", lemma: "διά", translit: "dia", morph: "Prep. + gen.", glosses: ["through"] },
          { id: "romans-3-0-4", surface: "πίστεως", lemma: "πίστις", translit: "pisteōs", morph: "Noun, gen. fem. sg.", glosses: ["faith", "trust", "faithfulness"] },
          { id: "romans-3-0-5", surface: "Ἰησοῦ", lemma: "Ἰησοῦς", translit: "Iēsou", morph: "Noun, gen. masc. sg.", glosses: ["of Jesus"] },
          { id: "romans-3-0-6", surface: "Χριστοῦ", lemma: "Χριστός", translit: "Christou", morph: "Noun, gen. masc. sg.", glosses: ["of Christ"], punctuationAfter: "." },
        ],
      },
    ],
  },
  {
    id: "ephesians-2",
    ref: "Ephesians 2:8–9",
    title: "By grace through faith",
    description: "χάρις and πίστις, with the contested ἔργον.",
    verses: [
      {
        ref: "Ephesians 2:8",
        englishText:
          "For by grace you have been saved through faith — and this is not your own doing; it is the gift of God.",
        tokens: [
          { id: "ephesians-2-0-0", surface: "τῇ", lemma: "ὁ", translit: "tē", morph: "Article, dat. fem. sg.", glosses: ["the"] },
          { id: "ephesians-2-0-1", surface: "γὰρ", lemma: "γάρ", translit: "gar", morph: "Conj.", glosses: ["for"] },
          { id: "ephesians-2-0-2", surface: "χάριτί", lemma: "χάρις", translit: "chariti", morph: "Noun, dat. fem. sg.", glosses: ["grace", "favor", "kindness"] },
          { id: "ephesians-2-0-3", surface: "ἐστε", lemma: "εἰμί", translit: "este", morph: "Verb, pres. ind. 2pl.", glosses: ["you are"] },
          { id: "ephesians-2-0-4", surface: "σεσῳσμένοι", lemma: "σῴζω", translit: "sesōsmenoi", morph: "Verb, perf. pass. ptc. nom. masc. pl.", glosses: ["having been saved"] },
          { id: "ephesians-2-0-5", surface: "διὰ", lemma: "διά", translit: "dia", morph: "Prep. + gen.", glosses: ["through"] },
          { id: "ephesians-2-0-6", surface: "πίστεως", lemma: "πίστις", translit: "pisteōs", morph: "Noun, gen. fem. sg.", glosses: ["faith"], punctuationAfter: ";" },
          { id: "ephesians-2-0-7", surface: "δῶρον", lemma: "δῶρον", translit: "dōron", morph: "Noun, nom. neut. sg.", glosses: ["gift"] },
        ],
      },
    ],
  },
  {
    id: "matthew-5",
    ref: "Matthew 5:3",
    title: "Blessed are the poor in spirit",
    description: "μακάριος and πτωχός — beatitude vocabulary.",
    verses: [
      {
        ref: "Matthew 5:3",
        englishText:
          "Blessed are the poor in spirit, for theirs is the kingdom of heaven.",
        tokens: [
          { id: "matthew-5-0-0", surface: "Μακάριοι", lemma: "μακάριος", translit: "makarioi", morph: "Adj., nom. masc. pl.", glosses: ["blessed", "fortunate", "happy"] },
          { id: "matthew-5-0-1", surface: "οἱ", lemma: "ὁ", translit: "hoi", morph: "Article, nom. masc. pl.", glosses: ["the"] },
          { id: "matthew-5-0-2", surface: "πτωχοὶ", lemma: "πτωχός", translit: "ptōchoi", morph: "Adj., nom. masc. pl.", glosses: ["poor", "destitute", "beggarly"] },
          { id: "matthew-5-0-3", surface: "τῷ", lemma: "ὁ", translit: "tō", morph: "Article, dat. neut. sg.", glosses: ["the"] },
          { id: "matthew-5-0-4", surface: "πνεύματι", lemma: "πνεῦμα", translit: "pneumati", morph: "Noun, dat. neut. sg.", glosses: ["spirit", "breath"], punctuationAfter: "," },
        ],
      },
    ],
  },
];
