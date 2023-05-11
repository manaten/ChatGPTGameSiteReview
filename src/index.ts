import fs from "fs/promises";

import { test } from "./lib/test";

async function main() {
  const content = await fs.readFile("package.json");
  console.log(content.toString());
  test();
}

main().catch(e => console.error(e));
