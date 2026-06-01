import fs from "fs";
import path from "path";

const folders = ["nt", "ot"];
const root = "src/lib/corpus/data";

for (const folder of folders) {
  const folderPath = path.join(root, folder);
  if (!fs.existsSync(folderPath)) continue;

  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const filePath = path.join(folderPath, file);

    // Skip if it's already a directory
    if (fs.lstatSync(filePath).isDirectory()) continue;

    console.log(`Processing ${filePath}...`);
    const bookId = path.basename(file, ".json");
    const bookData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (!bookData.verses) {
      console.warn(`No verses found in ${file}. Skipping.`);
      continue;
    }

    const chapters = {};
    for (const verse of bookData.verses) {
      const parts = verse.ref.split(" ");
      const refVerse = parts[parts.length - 1];
      const chNum = refVerse.split(":")[0];

      if (!chapters[chNum]) {
        chapters[chNum] = {
          id: `${bookId}-${chNum}`,
          name: bookData.name,
          chapter: parseInt(chNum, 10),
          verses: [],
          language: bookData.verses[0].language || (folder === "nt" ? "greek" : "hebrew"),
        };
      }
      chapters[chNum].verses.push(verse);
    }

    const bookDir = path.join(folderPath, bookId);
    fs.mkdirSync(bookDir, { recursive: true });

    for (const [chNum, chapterData] of Object.entries(chapters)) {
      const chapterPath = path.join(bookDir, `${chNum}.json`);
      fs.writeFileSync(chapterPath, JSON.stringify(chapterData));
    }

    // Remove the old combined file
    fs.unlinkSync(filePath);
    console.log(`✅ Split ${bookId} into ${Object.keys(chapters).length} chapters.`);
  }
}
