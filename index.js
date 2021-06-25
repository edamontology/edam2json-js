import { parseToJSON } from "./src/parser.js";

const fileExt = process.argv[2];

parseToJSON(fileExt);
