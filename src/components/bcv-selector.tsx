"use client";

import { useState } from "react";
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

interface BookMetadata {
  id: string;
  name: string;
  abbr: string;
  chaptersCount: number;
  versesCount: number;
  testament: "OT" | "NT";
  language: "greek" | "hebrew";
}

export function BcvSelector() {
  const [bookId, setBookId] = useState<string>("");
  const [chapter, setChapter] = useState<string>("");
  const [startVerse, setStartVerse] = useState("");
  const [endVerse, setEndVerse] = useState("");

  const books = booksIndex as BookMetadata[];

  const selectedBook = books.find((b) => b.id === bookId);
  const chapterOptions = selectedBook
    ? Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1)
    : [];

  const targetId = selectedBook && chapter ? `${selectedBook.id}-${chapter}` : "";
  const searchParams =
    startVerse && targetId
      ? {
          start: parseInt(startVerse, 10) || undefined,
          ...(endVerse ? { end: parseInt(endVerse, 10) || undefined } : {}),
        }
      : undefined;

  const otBooks = books.filter((b) => b.testament === "OT");
  const ntBooks = books.filter((b) => b.testament === "NT");

  const canGo = Boolean(targetId);

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
          setChapter("");
          setStartVerse("");
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

      <Select value={chapter} onValueChange={setChapter} disabled={!selectedBook}>
        <SelectTrigger className="w-full text-sm">
          <SelectValue placeholder={selectedBook ? "Select chapter" : "Choose a book first"} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {chapterOptions.map((c) => (
            <SelectItem key={c} value={String(c)}>
              Chapter {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          placeholder="From verse"
          aria-label="Start verse"
          className="h-9 text-sm"
          value={startVerse}
          onChange={(e) => {
            const value = e.target.value;
            setStartVerse(value);
            if (!value) setEndVerse("");
          }}
          disabled={!targetId}
        />
        <span className="text-sm text-muted-foreground" aria-hidden="true">
          –
        </span>
        <Input
          type="number"
          min={1}
          placeholder="To verse"
          aria-label="End verse"
          className="h-9 text-sm"
          value={endVerse}
          onChange={(e) => setEndVerse(e.target.value)}
          disabled={!targetId}
        />
      </div>

      {canGo ? (
        <Button asChild className="w-full">
          <Link to={`/reader/${targetId}`} search={searchParams}>
            Go to {selectedBook?.name} {chapter}
            {startVerse ? `:${startVerse}` : ""}
            {endVerse && endVerse !== startVerse ? `–${endVerse}` : ""}
          </Link>
        </Button>
      ) : (
        <Button disabled className="w-full">
          Go
        </Button>
      )}
    </div>
  );
}
