"use client";

import { useEffect, useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import booksIndex from "@/lib/corpus/data/books.json";
import { getChapterVerseCount, MAX_PASSAGE_SPAN } from "@/lib/corpus";

interface BookMetadata {
  id: string;
  name: string;
  abbr: string;
  chaptersCount: number;
  versesCount: number;
  testament: "OT" | "NT";
  language: "greek" | "hebrew";
}

function clampVerse(value: string, max: number | null): string {
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) return value;
  if (num < 1) return "1";
  if (max !== null && num > max) return String(max);
  return value;
}

export function BcvSelector() {
  const [bookId, setBookId] = useState<string>("");
  const [startChapter, setStartChapter] = useState<string>("");
  const [startVerse, setStartVerse] = useState("");
  const [endChapter, setEndChapter] = useState<string>("");
  const [endVerse, setEndVerse] = useState("");
  const [startMaxVerse, setStartMaxVerse] = useState<number | null>(null);
  const [endMaxVerse, setEndMaxVerse] = useState<number | null>(null);

  const books = booksIndex as BookMetadata[];
  const selectedBook = books.find((b) => b.id === bookId);

  const chapterOptions = selectedBook
    ? Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1)
    : [];

  const endChapterOptions =
    selectedBook && startChapter
      ? Array.from(
          {
            length: Math.min(
              selectedBook.chaptersCount - parseInt(startChapter, 10) + 1,
              MAX_PASSAGE_SPAN,
            ),
          },
          (_, i) => parseInt(startChapter, 10) + i,
        )
      : [];

  // Load start chapter verse count
  useEffect(() => {
    if (!selectedBook || !startChapter) {
      setStartMaxVerse(null);
      return;
    }
    let cancelled = false;
    getChapterVerseCount(selectedBook.id, parseInt(startChapter, 10)).then((count) => {
      if (!cancelled) setStartMaxVerse(count ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedBook, startChapter]);

  // Load end chapter verse count
  useEffect(() => {
    if (!selectedBook || !endChapter) {
      setEndMaxVerse(null);
      return;
    }
    let cancelled = false;
    getChapterVerseCount(selectedBook.id, parseInt(endChapter, 10)).then((count) => {
      if (!cancelled) setEndMaxVerse(count ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedBook, endChapter]);

  // Re-clamp existing verses when max changes
  useEffect(() => {
    if (startMaxVerse !== null) {
      setStartVerse((prev) => clampVerse(prev, startMaxVerse));
    }
  }, [startMaxVerse]);

  useEffect(() => {
    const max = endChapter ? endMaxVerse : startMaxVerse;
    if (max !== null) {
      setEndVerse((prev) => {
        let clamped = clampVerse(prev, max);
        if (
          clamped &&
          startChapter &&
          endChapter &&
          parseInt(startChapter, 10) === parseInt(endChapter, 10) &&
          startVerse
        ) {
          const s = parseInt(startVerse, 10);
          const e = parseInt(clamped, 10);
          if (!Number.isNaN(s) && !Number.isNaN(e) && e < s) {
            clamped = String(s);
          }
        }
        return clamped;
      });
    }
  }, [endMaxVerse, startMaxVerse, endChapter, startChapter, startVerse]);

  const targetUrl = useMemo(() => {
    if (!selectedBook || !startChapter) return "";

    const sCh = parseInt(startChapter, 10);
    const sV = startVerse ? parseInt(startVerse, 10) : undefined;
    const eCh = endChapter ? parseInt(endChapter, 10) : undefined;
    const eV = endVerse ? parseInt(endVerse, 10) : undefined;

    // Full chapter
    if (sV === undefined) {
      return `/reader/${selectedBook.id}-${sCh}`;
    }

    // Single verse
    if ((eCh === undefined || eCh === sCh) && eV === undefined) {
      return `/reader/${selectedBook.id}-${sCh}:${sV}`;
    }

    // Same-chapter range
    if (eCh === undefined || eCh === sCh) {
      return `/reader/${selectedBook.id}-${sCh}:${sV}-${eV}`;
    }

    // Cross-chapter range with end verse
    if (eV !== undefined) {
      return `/reader/${selectedBook.id}-${sCh}:${sV}-${eCh}:${eV}`;
    }

    // Cross-chapter range without end verse
    return `/reader/${selectedBook.id}-${sCh}:${sV}-${eCh}:`;
  }, [selectedBook, startChapter, startVerse, endChapter, endVerse]);

  const labelText = useMemo(() => {
    if (!selectedBook || !startChapter) return "";
    const sCh = parseInt(startChapter, 10);
    const sV = startVerse ? parseInt(startVerse, 10) : undefined;
    const eCh = endChapter ? parseInt(endChapter, 10) : undefined;
    const eV = endVerse ? parseInt(endVerse, 10) : undefined;

    let text = `${selectedBook.name} ${sCh}`;
    if (sV !== undefined) text += `:${sV}`;
    if (eV !== undefined && (eCh !== sCh || eV !== sV)) {
      if (eCh !== undefined && eCh !== sCh) {
        text += ` - ${eCh}`;
        text += `:${eV}`;
      } else {
        text += `-${eV}`;
      }
    } else if (eCh !== undefined && eCh !== sCh) {
      text += ` - ${eCh}`;
    }
    return text;
  }, [selectedBook, startChapter, startVerse, endChapter, endVerse]);

  const otBooks = books.filter((b) => b.testament === "OT");
  const ntBooks = books.filter((b) => b.testament === "NT");

  const canGo = Boolean(targetUrl);
  const startChapterNum = startChapter ? parseInt(startChapter, 10) : null;
  const endChapterNum = endChapter ? parseInt(endChapter, 10) : null;

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <BookOpen className="h-3 w-3" />
        Browse
      </p>

      <Select
        value={bookId}
        onValueChange={(value) => {
          setBookId(value);
          setStartChapter("");
          setStartVerse("");
          setEndChapter("");
          setEndVerse("");
        }}
      >
        <SelectTrigger className="w-full text-sm">
          <SelectValue placeholder="Select a book" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <SelectGroup>
            <SelectLabel>Old Testament</SelectLabel>
            {otBooks.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>New Testament</SelectLabel>
            {ntBooks.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          From chapter
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          To chapter
        </span>
        <Select
          value={startChapter}
          onValueChange={(value) => {
            setStartChapter(value);
            setStartVerse("");
            setEndChapter(value);
            setEndVerse("");
          }}
          disabled={!selectedBook}
        >
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="Choose…" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {chapterOptions.map((c) => (
              <SelectItem key={c} value={String(c)}>
                Ch {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={endChapter}
          onValueChange={(value) => {
            setEndChapter(value);
            setEndVerse("");
          }}
          disabled={!startChapter}
        >
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="Same" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {endChapterOptions.map((c) => (
              <SelectItem key={c} value={String(c)}>
                Ch {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          From verse
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          To verse
        </span>
        <Input
          type="number"
          min={1}
          max={startMaxVerse ?? undefined}
          placeholder="All"
          aria-label="Start verse"
          className="h-9 text-sm"
          value={startVerse}
          onChange={(e) => {
            let value = e.target.value;
            if (value) value = clampVerse(value, startMaxVerse);
            setStartVerse(value);
            if (!value) setEndVerse("");
          }}
          disabled={!startChapter}
        />
        <Input
          type="number"
          min={1}
          max={endMaxVerse ?? undefined}
          placeholder={endChapter !== startChapter ? "All" : "Same"}
          aria-label="End verse"
          className="h-9 text-sm"
          value={endVerse}
          onChange={(e) => {
            let value = e.target.value;
            if (value) {
              const max = endChapter ? endMaxVerse : startMaxVerse;
              value = clampVerse(value, max);
              if (
                startChapterNum !== null &&
                endChapterNum !== null &&
                startChapterNum === endChapterNum &&
                startVerse
              ) {
                const s = parseInt(startVerse, 10);
                const ev = parseInt(value, 10);
                if (!Number.isNaN(s) && !Number.isNaN(ev) && ev < s) {
                  value = String(s);
                }
              }
            }
            setEndVerse(value);
          }}
          disabled={!startChapter}
        />
      </div>

      {startMaxVerse !== null && (
        <p className="text-xs text-muted-foreground">
          {selectedBook?.name} {startChapter} has {startMaxVerse} verses
        </p>
      )}
      {endMaxVerse !== null && endChapter !== startChapter && (
        <p className="text-xs text-muted-foreground">
          {selectedBook?.name} {endChapter} has {endMaxVerse} verses
        </p>
      )}

      {canGo ? (
        <Button asChild className="w-full">
          <Link to={targetUrl}>Go to {labelText || `${selectedBook?.name} ${startChapter}`}</Link>
        </Button>
      ) : (
        <Button disabled className="w-full">
          Go
        </Button>
      )}
    </div>
  );
}
