const fs = require("fs");
const dir = ".next/static/chunks";
function findCss(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + "/" + e.name;
    if (e.isDirectory()) findCss(p, acc);
    else if (e.name.endsWith(".css")) acc.push(p);
  }
  return acc;
}
const files = findCss(dir).sort(
  (a, b) => fs.statSync(b).size - fs.statSync(a).size,
);
const css = files.map((f) => fs.readFileSync(f, "utf8")).join("\n");

const needles = [
  ".dark .bg-white{",
  ".dark .bg-\\[\\#FBFAF6\\]",
  ".dark .bg-\\[\\#164E63\\]",
  ".dark .hover\\:bg-green-50:hover",
  ".dark .hover\\:text-green-700:hover",
  ".dark .text-\\[\\#164E63\\]",
  ".dark .from-green-50.via-white.to-amber-50",
  ".dark .placeholder\\:text-slate-400::placeholder",
  ".dark .focus\\:bg-white:focus",
];

for (const n of needles) {
  console.log((css.includes(n) ? "OK   " : "MISS ") + n);
}

// Show how the dark block looks in the bundle (first 900 chars of it).
const i = css.indexOf(".dark .bg-white{");
console.log("\n--- bundle excerpt ---\n" + css.slice(i, i + 400));
