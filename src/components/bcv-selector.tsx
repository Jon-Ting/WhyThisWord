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
import { cn } from "@/lib/utils";
import booksIndex from "@/lib/corpus/data/books.json";
import { getChapterVerseCount, MAX_PASSAGE_SPAN } from "@/lib/corpus";

interface BcvSelectorProps {
  onGo?: (url: string) => void;
}

interface BookMetadata {
  id: string;
  name: string;
  abbr: string;
  chaptersCount: number;
  versesCount: number;
  testament: "OT" | "NT";
  language: "greek" | "hebrew";
}

function sanitizeVerse(value: string, max: number | null): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = parseInt(trimmed, 10);
  if (Number.isNaN(num)) return undefined;
  if (max !== null) {
    return Math.max(1, Math.min(num, max));
  }
  return Math.max(1, num);
}

export function BcvSelector({ onGo }: BcvSelectorProps) {
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

  const targetUrl = useMemo(() => {
    if (!selectedBook || !startChapter) return "";

    const sCh = parseInt(startChapter, 10);
    const sV = sanitizeVerse(startVerse, startMaxVerse);
    const eCh = endChapter ? parseInt(endChapter, 10) : undefined;
    const eV = sanitizeVerse(endVerse, endChapter ? endMaxVerse : startMaxVerse);

    // Full chapter
    if (sV === undefined) {
      if (eCh !== undefined && eCh !== sCh) {
        return `/reader/${selectedBook.id}-${sCh}:1-${eCh}:`;
      }
      return `/reader/${selectedBook.id}-${sCh}`;
    }

    // Single verse
    if ((eCh === undefined || eCh === sCh) && eV === undefined) {
      return `/reader/${selectedBook.id}-${sCh}:${sV}`;
    }

    // Same-chapter range
    if (eCh === undefined || eCh === sCh) {
      if (eV !== undefined && eV < sV) {
        return `/reader/${selectedBook.id}-${sCh}:${sV}`;
      }
      return `/reader/${selectedBook.id}-${sCh}:${sV}-${eV}`;
    }

    // Cross-chapter range with end verse
    if (eV !== undefined) {
      return `/reader/${selectedBook.id}-${sCh}:${sV}-${eCh}:${eV}`;
    }

    // Cross-chapter range without end verse
    return `/reader/${selectedBook.id}-${sCh}:${sV}-${eCh}:`;
  }, [selectedBook, startChapter, startVerse, endChapter, endVerse, startMaxVerse, endMaxVerse]);

  const labelText = useMemo(() => {
    if (!selectedBook || !startChapter) return "";
    const sCh = parseInt(startChapter, 10);
    const sV = sanitizeVerse(startVerse, startMaxVerse);
    const eCh = endChapter ? parseInt(endChapter, 10) : undefined;
    const eV = sanitizeVerse(endVerse, endChapter ? endMaxVerse : startMaxVerse);

    let text = `${selectedBook.name} ${sCh}`;
    if (sV !== undefined) text += `:${sV}`;
    if (sV !== undefined && eV !== undefined && (eCh !== sCh || eV !== sV)) {
      if (eCh !== undefined && eCh !== sCh) {
        text += ` - ${eCh}`;
        text += `:${eV}`;
      } else if (eV > sV) {
        text += `-${eV}`;
      }
    } else if (eCh !== undefined && eCh !== sCh) {
      text += ` - ${eCh}`;
    }
    return text;
  }, [selectedBook, startChapter, startVerse, endChapter, endVerse, startMaxVerse, endMaxVerse]);

  const startVerseError = useMemo(() => {
    if (!startVerse.trim()) return null;
    const num = parseInt(startVerse.trim(), 10);
    if (Number.isNaN(num)) return "Enter a valid number";
    if (num < 1) return "Must be at least 1";
    if (startMaxVerse !== null && num > startMaxVerse) {
      return `Max ${startMaxVerse} verses`;
    }
    return null;
  }, [startVerse, startMaxVerse]);

  const endVerseError = useMemo(() => {
    if (!endVerse.trim()) return null;
    if (!startVerse.trim()) return "Start verse required";
    const num = parseInt(endVerse.trim(), 10);
    if (Number.isNaN(num)) return "Enter a valid number";
    if (num < 1) return "Must be at least 1";
    const max = endChapter ? endMaxVerse : startMaxVerse;
    if (max !== null && num > max) {
      return `Max ${max} verses`;
    }
    if (endChapter === startChapter && startVerse.trim()) {
      const sNum = parseInt(startVerse.trim(), 10);
      if (!Number.isNaN(sNum) && num < sNum) {
        return "Must be after start";
      }
    }
    return null;
  }, [endVerse, endChapter, endMaxVerse, startMaxVerse, startVerse, startChapter]);

  const otBooks = books.filter((b) => b.testament === "OT");
  const ntBooks = books.filter((b) => b.testament === "NT");

  const canGo = Boolean(targetUrl);

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

      <div>
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
            className={cn(
              "h-9 text-sm",
              startVerseError && "border-destructive focus-visible:ring-destructive",
            )}
            aria-invalid={startVerseError ? "true" : "false"}
            value={startVerse}
            onKeyDown={(e) => {
              if ([".", "-", "+", "e", "E"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              setStartVerse(val);
              if (!val.trim()) setEndVerse("");
            }}
            disabled={!startChapter}
          />
          <Input
            type="number"
            min={1}
            max={endMaxVerse ?? undefined}
            placeholder={endChapter !== startChapter ? "All" : "Same"}
            aria-label="End verse"
            className={cn(
              "h-9 text-sm",
              endVerseError && "border-destructive focus-visible:ring-destructive",
            )}
            aria-invalid={endVerseError ? "true" : "false"}
            value={endVerse}
            onKeyDown={(e) => {
              if ([".", "-", "+", "e", "E"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              setEndVerse(val);
            }}
            disabled={!startChapter}
          />
        </div>
        {(startVerseError || endVerseError) && (
          <div className="mt-1 grid grid-cols-2 gap-x-2">
            {startVerseError && <p className="text-xs text-destructive">{startVerseError}</p>}
            {endVerseError && (
              <p className={cn("text-xs text-destructive", !startVerseError && "col-start-2")}>
                {endVerseError}
              </p>
            )}
          </div>
        )}
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
        onGo ? (
          <Button onClick={() => onGo(targetUrl)} className="w-full">
            Go to {labelText || `${selectedBook?.name} ${startChapter}`}
          </Button>
        ) : (
          <Button asChild className="w-full">
            <Link to={targetUrl}>Go to {labelText || `${selectedBook?.name} ${startChapter}`}</Link>
          </Button>
        )
      ) : (
        <Button disabled className="w-full">
          Go
        </Button>
      )}
    </div>
  );
}
