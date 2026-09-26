#!/usr/bin/env node
/**
 * Builds the static icon manifests consumed by the site.
 *
 * Reads open-source SVG icon sets from node_modules, normalizes them as configured,
 * optionally reads the separate pride flag catalog from PRIDE_FLAGS_DIR, and writes:
 *   - public/manifests/<setId>.json  (full set, fetched lazily by the app)
 *   - src/data/summaries.json        (small card metadata for the home page)
 *
 * Run with: npm run manifests
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, basename, resolve } from "node:path";

const ROOT = process.cwd();

/** Drop these root attributes: sizing, classes, a11y noise, link namespaces. */
const DROP_ATTRS = new Set([
  "width",
  "height",
  "class",
  "id",
  "xmlns",
  "xmlns:xlink",
  "aria-hidden",
  "data-slot",
  "role",
  "version",
  "x",
  "y",
]);

/** Attributes that should survive normalization untouched. */
const KEEP_ATTRS = new Set([
  "viewBox",
  "fill",
  "stroke",
  "fill-rule",
  "clip-rule",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-opacity",
  "fill-opacity",
  "opacity",
]);

const SETS = [
  {
    id: "feather",
    name: "Feather",
    description:
      "The original minimalist stroke set: 287 icons drawn on a 24px grid with a consistent 2px round stroke.",
    license: "MIT",
    licenseUrl: "https://github.com/feathericons/feather/blob/master/LICENSE",
    sourceUrl: "https://github.com/feathericons/feather",
    style: "stroke",
    iconsDir: "node_modules/feather-icons/dist/icons",
  },
  {
    id: "lucide",
    name: "Lucide",
    description:
      "The community-grown successor to Feather: 2,000+ icons in the same clean 24px stroke language.",
    license: "ISC",
    licenseUrl: "https://github.com/lucide-icons/lucide/blob/main/LICENSE",
    sourceUrl: "https://github.com/lucide-icons/lucide",
    style: "stroke",
    iconsDir: "node_modules/lucide-static/icons",
  },
  {
    id: "heroicons",
    name: "Heroicons",
    description:
      "Hand-built by the Tailwind CSS team. 648 icons split into outline and solid styles at 24px.",
    license: "MIT",
    licenseUrl: "https://github.com/tailwindlabs/heroicons/blob/master/LICENSE",
    sourceUrl: "https://github.com/tailwindlabs/heroicons",
    style: "stroke",
    groups: [
      { category: "outline", iconsDir: "node_modules/heroicons/24/outline" },
      { category: "solid", iconsDir: "node_modules/heroicons/24/solid" },
    ],
  },
  {
    id: "bootstrap-icons",
    name: "Bootstrap Icons",
    description:
      "The official Bootstrap icon family: 2,000+ solid glyphs drawn on a 16px grid, free for any project.",
    license: "MIT",
    licenseUrl: "https://github.com/twbs/icons/blob/main/LICENSE.md",
    sourceUrl: "https://github.com/twbs/icons",
    style: "solid",
    iconsDir: "node_modules/bootstrap-icons/icons",
  },
  {
    id: "phosphor",
    name: "Phosphor",
    description:
      "A flexible all-purpose icon family with six expressive weights: thin, light, regular, bold, fill, and duotone.",
    license: "MIT",
    licenseUrl: "https://github.com/phosphor-icons/core/blob/main/LICENSE",
    sourceUrl: "https://phosphoricons.com/",
    attribution: "Phosphor Icons",
    style: "stroke",
    groups: [
      { category: "thin", iconsDir: "node_modules/@phosphor-icons/core/assets/thin" },
      { category: "light", iconsDir: "node_modules/@phosphor-icons/core/assets/light" },
      { category: "regular", iconsDir: "node_modules/@phosphor-icons/core/assets/regular" },
      { category: "bold", iconsDir: "node_modules/@phosphor-icons/core/assets/bold" },
      { category: "fill", iconsDir: "node_modules/@phosphor-icons/core/assets/fill" },
      { category: "duotone", iconsDir: "node_modules/@phosphor-icons/core/assets/duotone" },
    ],
  },
  {
    id: "devicon",
    name: "Devicon",
    description:
      "Programming language, framework, and developer-tool logos in original and monochrome variants.",
    license: "MIT",
    licenseUrl: "https://github.com/devicons/devicon/blob/master/LICENSE",
    sourceUrl: "https://devicon.dev/",
    attribution: "Devicon contributors",
    style: "solid",
    includeWordmarks: false,
    groups: [
      { category: "original", iconsDir: "node_modules/devicon/icons", filePattern: /-original(-wordmark)?.svg$/, recursive: true },
      { category: "plain", iconsDir: "node_modules/devicon/icons", filePattern: /-plain(-wordmark)?.svg$/, recursive: true },
      { category: "line", iconsDir: "node_modules/devicon/icons", filePattern: /-line(-wordmark)?.svg$/, recursive: true },
    ],
  },
  {
    id: "flag-icons",
    name: "Flag Icons",
    description:
      "Country and territory flags as crisp 4:3 SVGs, ready to recolor, resize, and export.",
    license: "MIT",
    licenseUrl: "https://github.com/lipis/flag-icons/blob/main/LICENSE",
    sourceUrl: "https://github.com/lipis/flag-icons",
    attribution: "Panayiotis Lipiridis",
    style: "solid",
    iconsDir: "node_modules/flag-icons/flags/4x3",
    filenameNames: true,
    preserveColors: true,
    preserveIds: true,
    svgAttributes: ' preserveAspectRatio="xMidYMid meet"',
    defaultCategory: "country-flags",
    iconWidth: 640,
  },
  {
    id: "circle-flags",
    name: "Circle Flags",
    description:
      "Over 400 minimal circular SVG flags for countries, regions, states, and languages.",
    license: "MIT",
    licenseUrl: "https://github.com/HatScripts/circle-flags/blob/gh-pages/LICENSE.md",
    sourceUrl: "https://hatscripts.github.io/circle-flags/",
    attribution: "HatScripts",
    style: "solid",
    iconsDir: "node_modules/circle-flags/flags",
    filenameNames: true,
    preserveColors: true,
    preserveIds: true,
    defaultCategory: "circle-flags",
    iconWidth: 512,
  },
  {
    id: "skill-icons",
    name: "Skill Icons",
    description:
      "Colorful icons for programming languages, frameworks, tools, and technologies, with dark and light variants.",
    license: "MIT",
    licenseUrl: "https://github.com/tandpfun/skill-icons/blob/main/LICENSE",
    sourceUrl: "https://skillicons.dev/",
    attribution: "tandpfun",
    style: "solid",
    iconsDir: "node_modules/skill-icons/icons",
    preserveColors: true,
    preserveIds: true,
    defaultCategory: "skill-icons",
    iconWidth: 256,
  },
  {
    id: "pride-flags",
    name: "Glyphary Pride Flags",
    description:
      "A growing library of LGBTQIA+ pride flags in full-color SVG. Flag colors and designs reflect community conventions, which may vary.",
    license: "MIT",
    licenseUrl: "",
    sourceUrl: "https://github.com/Glyphary-Icons/pride-flag-icons",
    attribution: "Glyphary contributors",
    style: "solid",
    prideSource: true,
    groups: [
      { category: "inclusive" },
      { category: "orientation" },
      { category: "gender" },
      { category: "intersex" },
      { category: "relationships" },
      { category: "community" },
    ],
  },
  {
    id: "pixel-icon-library",
    name: "Pixel Icon Library",
    description:
      "HackerNoon’s pixel-perfect 24px icon set: 578 icons across regular, solid, brand, and curated category graphics.",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    sourceUrl: "https://pixeliconlibrary.com/",
    attribution: "HackerNoon",
    style: "solid",
    fill: "currentColor",
    groups: [
      { category: "regular", iconsDir: "node_modules/@hackernoon/pixel-icon-library/icons/SVG/regular" },
      { category: "solid", iconsDir: "node_modules/@hackernoon/pixel-icon-library/icons/SVG/solid" },
      { category: "brands", iconsDir: "node_modules/@hackernoon/pixel-icon-library/icons/SVG/brands" },
      {
        category: "categories",
        iconsDir: "node_modules/@hackernoon/pixel-icon-library/icons/SVG/purcats",
      },
    ],
  },
];

const ATTR_RE = /([\w:.-]+)\s*=\s*"([^"]*)"/g;

function attrMap(raw) {
  const out = [];
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(raw)) !== null) out.push([m[1], m[2]]);
  return out;
}

/** Normalize one SVG source file into a compact, currentColor-only body. */
function normalizeSvg(source, iconWidth, defaultFill, preserveColors = false, preserveIds = false, svgAttributes = "") {
  let text = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?xml[^>]*\?>/g, "")
    .trim();

  const open = text.match(/<svg\b([^>]*)>/i);
  if (!open) throw new Error("no <svg> root");

  const attrs = attrMap(open[1]);
  const pairs = attrs.map(([k, v]) => [k, v]);

  const hasViewBox = pairs.some(([k]) => k.toLowerCase() === "viewbox");
  let width = iconWidth;
  let height = iconWidth;
  if (!hasViewBox) {
    const w = pairs.find(([k]) => k.toLowerCase() === "width");
    const h = pairs.find(([k]) => k.toLowerCase() === "height");
    width = w ? parseFloat(w[1]) : iconWidth;
    height = h ? parseFloat(h[1]) : iconWidth;
  }

  const kept = pairs
    .filter(([k]) => !DROP_ATTRS.has(k) && KEEP_ATTRS.has(k))
    .map(([k, v]) => {
      if (k === "fill" || k === "stroke") {
        if (preserveColors) return `${k}="${v}"`;
        if (v === "none") return `${k}="none"`;
        if (v === "currentColor") return `${k}="currentColor"`;
        return `${k}="currentColor"`;
      }
      return `${k}="${v}"`;
    });
  if (defaultFill && !pairs.some(([k]) => k === "fill")) {
    kept.push(`fill="${defaultFill}"`);
  }

  // Inner markup: everything between the root open tag and the closing </svg>.
  const start = open.index + open[0].length;
  const endIdx = text.lastIndexOf("</svg>");
  let inner = (endIdx > start ? text.slice(start, endIdx) : text.slice(start)).trim();

  // Strip stray ids inside the body so duplicate icons never collide in the DOM.
  if (!preserveIds) inner = inner.replace(/\s+id="[^"]*"/g, "");
  inner = inner.replace(/\s+class="[^"]*"/g, "");
  if (!preserveColors) {
    inner = inner.replace(/\b(fill|stroke)="(?!none|currentColor)[^"]*"/g, '$1="currentColor"');
    inner = inner.replace(/\s+fill="none"/g, "");
  }
  inner = inner.replace(/\s+aria-[a-z-]+="[^"]*"/g, "");
  inner = inner.replace(/\s+data-[\w-]+="[^"]*"/g, "");
  // Collapse inter-tag whitespace but keep meaningful whitespace in <text>.
  if (!/<text\b/i.test(inner)) {
    inner = inner.replace(/>\s+</g, "><").replace(/\s*[\r\n]\s*/g, " ");
  }

  const viewBox = hasViewBox
    ? pairs.find(([k]) => k.toLowerCase() === "viewbox")[1]
    : `0 0 ${width} ${height}`;

  const root = [
    'xmlns="http://www.w3.org/2000/svg"',
    `viewBox="${viewBox}"`,
    ...kept.filter((a) => !/^viewBox=/i.test(a)),
  ].join(" ");

  return `<svg ${root}${svgAttributes}>${inner}</svg>`;
}

function tagsFor(name) {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
  return Array.from(new Set(words));
}

function listSvgs(dir, pattern, recursive = false) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) throw new Error(`missing icons dir: ${dir}`);
  const files = recursive
    ? readdirSync(abs, { recursive: true }).filter((f) => typeof f === "string")
    : readdirSync(abs);
  return files
    .filter((f) => f.endsWith(".svg") && (!pattern || pattern.test(basename(f))))
    .sort();
}

function buildSet(config) {
  if (config.prideSource) {
    const prideDir = process.env.PRIDE_FLAGS_DIR;
    const prideRoot = prideDir ? resolve(ROOT, prideDir) : "";
    if (!prideRoot || !existsSync(join(prideRoot, "flags.json"))) {
      console.warn("! PRIDE_FLAGS_DIR not set; reusing the checked-in Pride Flags manifest.");
      const previous = JSON.parse(readFileSync(join(ROOT, "public", "manifests", "pride-flags.json"), "utf8"));
      const categories = [...new Set(previous.icons.map((icon) => icon.category).filter(Boolean))];
      const categoryPreviews = {};
      const categoryCounts = {};
      for (const icon of previous.icons) {
        if (!icon.category) continue;
        categoryPreviews[icon.category] ??= icon.svg;
        categoryCounts[icon.category] = (categoryCounts[icon.category] ?? 0) + 1;
      }
      return {
        ...config,
        categories,
        categoryPreviews,
        categoryCounts,
        filterCategories: categories,
        browseCategories: categories,
        count: previous.count,
        preview: previous.icons.slice(0, 6).map((icon) => icon.svg),
        icons: previous.icons,
      };
    }
    const entries = JSON.parse(readFileSync(join(prideRoot, "flags.json"), "utf8"));
    const categories = [...new Set(entries.map((entry) => entry.category))];
    const categoryPreviews = {};
    const categoryCounts = {};
    const icons = entries.map((entry) => {
      if (!entry.name || !entry.category || !Array.isArray(entry.tags) || typeof entry.path !== "string" || !/^flags\/[a-z-]+\/[a-z0-9-]+\.svg$/.test(entry.path)) {
        throw new Error(`invalid pride flag catalog entry: ${entry.name ?? "(unnamed)"}`);
      }
      const svg = readFileSync(join(prideRoot, entry.path), "utf8").trim();
      if (
        !svg.startsWith("<svg ") ||
        !svg.endsWith("</svg>") ||
        /<script\b|<foreignObject\b|(?:href|style|on[a-z]+)\s*=/i.test(svg) ||
        !/<svg\b[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(svg) ||
        !/<svg\b[^>]*viewBox="\d+ \d+ \d+ \d+"/.test(svg)
      ) {
        throw new Error(`invalid or unsafe SVG asset for ${entry.name}`);
      }
      const icon = { name: entry.name, tags: [...new Set([...tagsFor(entry.name), ...(entry.tags ?? []).flatMap(tagsFor), "first-party-svg"])], category: entry.category, svg };
      categoryPreviews[entry.category] ??= svg;
      categoryCounts[entry.category] = (categoryCounts[entry.category] ?? 0) + 1;
      return icon;
    });
    const { prideSource: _prideSource, groups: _groups, ...meta } = config;
    return {
      ...meta,
      categories,
      categoryPreviews,
      categoryCounts,
      filterCategories: categories,
      browseCategories: categories,
      count: icons.length,
      preview: icons.slice(0, 6).map((icon) => icon.svg),
      icons,
    };
  }

  const groups = config.groups ?? [{ category: undefined, iconsDir: config.iconsDir }];
  const icons = [];
  const categories = [];

  for (const group of groups) {
    if (group.category && !categories.includes(group.category)) {
      categories.push(group.category);
    }
    for (const file of listSvgs(group.iconsDir, group.filePattern, group.recursive)) {
      const raw = readFileSync(join(ROOT, group.iconsDir, file), "utf8");
      const filename = basename(file, ".svg");
      const name = group.filenameNames && config.id !== "circle-flags"
        ? countryNames[filename.toLowerCase()] ?? filename
        : filename;
      const filenameWithoutStyle = filename
        .replace(/-(original|plain|line)(-wordmark)?$/i, "")
        .replace(config.id === "phosphor" ? new RegExp(`-${group.category}$`) : /$^/, "");
      const iconName = filenameWithoutStyle || filename;
      const isWordmark = filename.endsWith("-wordmark");
      if (config.includeWordmarks === false && isWordmark) continue;
      let svg;
      try {
        svg = normalizeSvg(
          raw,
          config.iconWidth ?? (config.style === "solid" ? 16 : 24),
          config.fill,
          config.preserveColors,
          config.preserveIds,
          config.svgAttributes,
        );
      } catch (err) {
        console.warn(`  ! skipping ${config.id}/${file}: ${err.message}`);
        continue;
      }
      let category = group.category;
      let displayName = iconName;
      let extraTags = [];
      if (config.id === "circle-flags") {
        displayName = countryNames[filename.toLowerCase()] ?? filename.replaceAll("_", " ").replace(/\\b\\w/g, (letter) => letter.toUpperCase());
        extraTags = [filename.toLowerCase(), "flag", "country", "region"];
        const baseCode = filename.split("-")[0].toLowerCase();
        if (baseCode !== filename.toLowerCase()) extraTags.push(baseCode, baseCode.toUpperCase());
      }
      if (config.id === "skill-icons") {
        const variant = filename.match(/-(Dark|Light)$/);
        if (variant) {
          category = variant[1].toLowerCase();
          displayName = filename.slice(0, -variant[0].length);
        } else {
          category = "standard";
        }
        extraTags = [filename.toLowerCase(), "technology", "developer"];
      }
      const icon = {
        name: displayName,
        tags: [...tagsFor(`${displayName} ${filename.replace(/-(original|plain|line)(-wordmark)?$/i, "")}`), ...extraTags],
        svg,
      };
      if (isWordmark) icon.category = `${group.category ?? "default"} wordmark`;
      if (category) icon.category = category;
      if (config.defaultCategory) {
        if (config.id !== "skill-icons") icon.category = config.defaultCategory;
        if (config.id === "circle-flags") icon.tags.push(filename.toUpperCase());
        if (config.id === "skill-icons") icon.tags.push(config.defaultCategory);
      }
      if (config.id === "pixel-icon-library" && group.category === "categories") {
        icon.tags.push(...tagsFor(name));
      }
      icons.push(icon);
    }
  }

  if (icons.length === 0) throw new Error(`set ${config.id} produced no icons`);

  const { iconsDir: _a, groups: _b, sourceJson: _sourceJson, prideSource: _prideSource, ...meta } = config;
  const categoryPreviews = {};
  const categoryCounts = {};
  const previewIndex = ["flag-icons", "circle-flags"].includes(config.id)
    ? icons.findIndex((icon) => icon.tags.includes("us"))
    : -1;
  const filterCategories = [];
  for (const icon of icons) {
    if (!icon.category) continue;
    categoryCounts[icon.category] = (categoryCounts[icon.category] ?? 0) + 1;
    categoryPreviews[icon.category] ??= icon.svg;
    if (!filterCategories.includes(icon.category)) filterCategories.push(icon.category);
  }
  const browseCategories = filterCategories.filter((category) => category !== "categories");
  if (config.filenameNames && config.id !== "circle-flags") {
    for (let index = 0; index < icons.length; index += 1) {
      const code = Object.keys(countryNames).find((countryCode) => countryNames[countryCode] === icons[index].name);
      const countryCode = code ?? icons[index].name.toLowerCase();
      icons[index].tags.push(countryCode, countryCode.toUpperCase());
      icons[index].name = countryNames[countryCode] ?? icons[index].name;
    }
  }

  return {
    ...meta,
    categories,
    categoryPreviews,
    categoryCounts,
    filterCategories,
    browseCategories,
    count: icons.length,
    preview: ["flag-icons", "circle-flags"].includes(config.id) && previewIndex >= 0
      ? [icons[previewIndex].svg, ...icons.filter((_, index) => index !== previewIndex).slice(0, 5).map((icon) => icon.svg)]
      : icons.slice(0, 6).map((i) => i.svg),
    icons,
  };
}

mkdirSync(join(ROOT, "public", "manifests"), { recursive: true });
mkdirSync(join(ROOT, "src", "data"), { recursive: true });

const summaries = [];

const countryNames = {
  ac: "Ascension Island", ad: "Andorra", ae: "United Arab Emirates", af: "Afghanistan",
  ag: "Antigua and Barbuda", ai: "Anguilla", al: "Albania", am: "Armenia", ao: "Angola",
  aq: "Antarctica", ar: "Argentina", as: "American Samoa", at: "Austria", au: "Australia",
  aw: "Aruba", ax: "Åland Islands", az: "Azerbaijan", ba: "Bosnia and Herzegovina",
  bb: "Barbados", bd: "Bangladesh", be: "Belgium", bf: "Burkina Faso", bg: "Bulgaria",
  bh: "Bahrain", bi: "Burundi", bj: "Benin", bl: "Saint Barthélemy", bm: "Bermuda",
  bn: "Brunei", bo: "Bolivia", bq: "Caribbean Netherlands", br: "Brazil", bs: "Bahamas",
  bt: "Bhutan", bv: "Bouvet Island", bw: "Botswana", by: "Belarus", bz: "Belize",
  ca: "Canada", cc: "Cocos Islands", cd: "DR Congo", cf: "Central African Republic",
  cg: "Republic of the Congo", ch: "Switzerland", ci: "Côte d’Ivoire", ck: "Cook Islands",
  cl: "Chile", cm: "Cameroon", cn: "China", co: "Colombia", cr: "Costa Rica", cu: "Cuba",
  cv: "Cape Verde", cw: "Curaçao", cx: "Christmas Island", cy: "Cyprus", cz: "Czechia",
  de: "Germany", dj: "Djibouti", dk: "Denmark", dm: "Dominica", do: "Dominican Republic",
  dz: "Algeria", ec: "Ecuador", ee: "Estonia", eg: "Egypt", eh: "Western Sahara",
  er: "Eritrea", es: "Spain", et: "Ethiopia", eu: "European Union", fi: "Finland",
  fj: "Fiji", fk: "Falkland Islands", fm: "Micronesia", fo: "Faroe Islands", fr: "France",
  ga: "Gabon", gb: "United Kingdom", gd: "Grenada", ge: "Georgia", gf: "French Guiana",
  gg: "Guernsey", gh: "Ghana", gi: "Gibraltar", gl: "Greenland", gm: "Gambia",
  gn: "Guinea", gp: "Guadeloupe", gq: "Equatorial Guinea", gr: "Greece", gs: "South Georgia",
  gt: "Guatemala", gu: "Guam", gw: "Guinea-Bissau", gy: "Guyana", hk: "Hong Kong",
  hm: "Heard Island", hn: "Honduras", hr: "Croatia", ht: "Haiti", hu: "Hungary",
  id: "Indonesia", ie: "Ireland", il: "Israel", im: "Isle of Man", in: "India",
  io: "British Indian Ocean Territory", iq: "Iraq", ir: "Iran", is: "Iceland", it: "Italy",
  je: "Jersey", jm: "Jamaica", jo: "Jordan", jp: "Japan", ke: "Kenya", kg: "Kyrgyzstan",
  kh: "Cambodia", ki: "Kiribati", km: "Comoros", kn: "Saint Kitts and Nevis", kp: "North Korea",
  kr: "South Korea", kw: "Kuwait", ky: "Cayman Islands", kz: "Kazakhstan", la: "Laos",
  lb: "Lebanon", lc: "Saint Lucia", li: "Liechtenstein", lk: "Sri Lanka", lr: "Liberia",
  ls: "Lesotho", lt: "Lithuania", lu: "Luxembourg", lv: "Latvia", ly: "Libya", ma: "Morocco",
  mc: "Monaco", md: "Moldova", me: "Montenegro", mf: "Saint Martin", mg: "Madagascar",
  mh: "Marshall Islands", mk: "North Macedonia", ml: "Mali", mm: "Myanmar", mn: "Mongolia",
  mo: "Macao", mp: "Northern Mariana Islands", mq: "Martinique", mr: "Mauritania", ms: "Montserrat",
  mt: "Malta", mu: "Mauritius", mv: "Maldives", mw: "Malawi", mx: "Mexico", my: "Malaysia",
  mz: "Mozambique", na: "Namibia", nc: "New Caledonia", ne: "Niger", nf: "Norfolk Island",
  ng: "Nigeria", ni: "Nicaragua", nl: "Netherlands", no: "Norway", np: "Nepal", nr: "Nauru",
  nu: "Niue", nz: "New Zealand", om: "Oman", pa: "Panama", pe: "Peru", pf: "French Polynesia",
  pg: "Papua New Guinea", ph: "Philippines", pk: "Pakistan", pl: "Poland", pm: "Saint Pierre and Miquelon",
  pn: "Pitcairn Islands", pr: "Puerto Rico", ps: "Palestine", pt: "Portugal", pw: "Palau",
  py: "Paraguay", qa: "Qatar", re: "Réunion", ro: "Romania", rs: "Serbia", ru: "Russia",
  rw: "Rwanda", sa: "Saudi Arabia", sb: "Solomon Islands", sc: "Seychelles", sd: "Sudan",
  se: "Sweden", sg: "Singapore", sh: "Saint Helena", si: "Slovenia", sj: "Svalbard and Jan Mayen",
  sk: "Slovakia", sl: "Sierra Leone", sm: "San Marino", sn: "Senegal", so: "Somalia",
  sr: "Suriname", ss: "South Sudan", st: "São Tomé and Príncipe", sv: "El Salvador",
  sx: "Sint Maarten", sy: "Syria", sz: "Eswatini", tc: "Turks and Caicos Islands",
  td: "Chad", tf: "French Southern Territories", tg: "Togo", th: "Thailand", tj: "Tajikistan",
  tk: "Tokelau", tl: "Timor-Leste", tm: "Turkmenistan", tn: "Tunisia", to: "Tonga",
  tr: "Türkiye", tt: "Trinidad and Tobago", tv: "Tuvalu", tw: "Taiwan", tz: "Tanzania",
  ua: "Ukraine", ug: "Uganda", um: "US Outlying Islands", un: "United Nations", us: "United States",
  uy: "Uruguay", uz: "Uzbekistan", va: "Vatican City", vc: "Saint Vincent and the Grenadines",
  ve: "Venezuela", vg: "British Virgin Islands", vi: "US Virgin Islands", vn: "Vietnam",
  vu: "Vanuatu", wf: "Wallis and Futuna", ws: "Samoa", xk: "Kosovo", ye: "Yemen",
  yt: "Mayotte", za: "South Africa", zm: "Zambia", zw: "Zimbabwe",
};

for (const config of SETS) {
  const set = buildSet(config);
  const full = {
    setId: set.setId ?? set.id,
    id: set.id,
    name: set.name,
    description: set.description,
    license: set.license,
    licenseUrl: set.licenseUrl,
    sourceUrl: set.sourceUrl,
    attribution: set.attribution,
    style: set.style,
    categories: set.categories,
    count: set.count,
    icons: set.icons,
  };
  writeFileSync(join(ROOT, "public", "manifests", `${config.id}.json`), JSON.stringify(full));
  summaries.push({
    id: set.id,
    name: set.name,
    description: set.description,
    license: set.license,
    licenseUrl: set.licenseUrl,
    sourceUrl: set.sourceUrl,
    attribution: set.attribution,
    style: set.style,
    categories: set.categories,
    count: set.count,
    preview: set.preview,
    filterCategories: set.filterCategories,
    browseCategories: set.browseCategories,
    categoryPreviews: set.categoryPreviews,
    categoryCounts: set.categoryCounts,
  });
  const bytes = JSON.stringify(full).length;
  console.log(`✓ ${set.name}: ${set.count} icons (${(bytes / 1024).toFixed(0)} KB)`);
}

writeFileSync(join(ROOT, "src", "data", "summaries.json"), JSON.stringify(summaries, null, 2));
console.log(`✓ summaries.json written with ${summaries.length} sets`);
