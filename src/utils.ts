import { createWriteStream } from "fs";

export function writeJSONFile(jsonObj: Record<string, any>, filePath: string) {
  const file = createWriteStream(filePath);

  file.on("error", (err) => console.error(err.message));
  file.write(JSON.stringify(jsonObj));
  file.end();
}

export function writeFile(tsvText: string, filePath: string) {
  const file = createWriteStream(filePath);

  file.on("error", (err) => console.error(err.message));

  file.write(tsvText);
  file.end();
}
