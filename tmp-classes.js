const fs = require("fs");
const path = require("path");

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "ui") continue;
      walk(p, acc);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      acc.push(p);
    }
  }
  return acc;
}

const files = walk("src");
const token = /[A-Za-z0-9_\-\[\]#\/\.%]+/g;
const counts = new Map();

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    const raw = (m[1] ?? m[2] ?? "").replace(/\$\{[^}]*\}/g, " ");
    for (const cls of raw.match(token) ?? []) {
      if (/^(bg|from|via|to|text|border|ring|placeholder|divide|shadow)/.test(cls)) {
        counts.set(cls, (counts.get(cls) ?? 0) + 1);
      }
    }
  }
}

const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
console.log(rows.map(([k, v]) => String(v).padStart(4) + "  " + k).join("\n"));
