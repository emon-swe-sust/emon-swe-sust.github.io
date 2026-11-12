/**
 * Describes everything in src/data.json that the site renders, so one generic
 * editor can create / edit / reorder / delete all of it.
 *
 * Field types:
 *   text, longtext, url, bool, image      single values
 *   daterange start/end month + year, or "Present", stored as text such as "Nov 2023 - Present"
 *   tags      short list of strings (chips)        strings   list of strings (rows)
 *   images    list of image paths                  objects   list of objects (cards)
 *   object    a nested object that may be absent
 *
 * `optional: true` means "leave the key out of data.json when empty", which is
 * what the site's `section.x && ...` checks expect. Fields without it are
 * always written (an empty string / list when blank), as in the current file.
 */

// ---------------------------------------------------------------- helpers ---

export const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";

export const getIn = (obj, path) =>
  path.reduce((acc, key) => (acc === undefined || acc === null ? undefined : acc[key]), obj);

export function setIn(obj, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[head] = setIn(obj ? obj[head] : undefined, rest, value);
  return copy;
}

export const isEmptyValue = (v) =>
  v === undefined || v === null || v === "" || v === false || (Array.isArray(v) && v.length === 0);

/** Sets obj[field.key]; drops the key instead when the field is optional and now empty. */
export function setField(obj, field, value) {
  if (field.optional && isEmptyValue(value)) {
    const copy = { ...obj };
    delete copy[field.key];
    return copy;
  }
  return { ...obj, [field.key]: value };
}

export function moveItem(list, index, delta) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

// ----------------------------------------------------------------- fields ---

const text = (key, label, extra = {}) => ({ key, label, type: "text", ...extra });
const longtext = (key, label, extra = {}) => ({ key, label, type: "longtext", ...extra });
const url = (key, label, extra = {}) => ({ key, label, type: "url", placeholder: "https://…", ...extra });
const daterange = (key, label, extra = {}) => ({ key, label, type: "daterange", ...extra });
const tags = (key, label, extra = {}) => ({ key, label, type: "tags", ...extra });
const strings = (key, label, extra = {}) => ({ key, label, type: "strings", ...extra });

const HTML_HELP = "HTML is allowed here, e.g. <a href=\"https://…\">link</a>.";

const logoFields = [
  {
    key: "logo-light",
    label: "Logo (light theme)",
    type: "image",
    optional: true,
    uploadDir: () => "organizations",
    help: "Shown next to the title. Leave empty for no logo.",
  },
  {
    key: "logo-dark",
    label: "Logo (dark theme)",
    type: "image",
    optional: true,
    uploadDir: () => "organizations",
    help: "Optional. Falls back to the light logo.",
  },
  {
    key: "logo-box",
    label: "White background behind logo (dark theme)",
    type: "bool",
    optional: true,
    help: "Tick this for logos with dark artwork or a solid background, so they stay visible in dark theme.",
  },
];

const ORGANIZATION_FIELDS = [
  text("title", "Organization", { required: true }),
  url("title_link", "Link", { optional: true }),
  ...logoFields,
  daterange("year", "Dates", { placeholder: "Feb 2022 - Feb 2023" }),
  text("titleSecond", "Role"),
];

const EDUCATION_FIELDS = [
  text("title", "Institution", { required: true }),
  url("title_link", "Institution link", { optional: true }),
  ...logoFields,
  text("titleSecond", "Degree"),
  daterange("year", "Dates", { placeholder: "2018-2022" }),
  text("cgpa", "CGPA", { optional: true, help: "Shown as “CGPA: …”. Use either CGPA or GPA." }),
  text("gpa", "GPA", { optional: true, help: "Shown as “GPA: …” (only if CGPA is empty)." }),
  text("location", "Location", { optional: true }),
  url("location_link", "Location map link", { optional: true, help: "Required when a location is set." }),
  longtext("description", "Description", { optional: true }),
  {
    key: "publications",
    label: "Research works",
    type: "objects",
    optional: true,
    itemLabel: "publication",
    blank: () => ({ title: "", description: "", link: "" }),
    fields: [
      text("title", "Title", { required: true }),
      url("link", "Link", { required: true }),
      longtext("description", "Description"),
    ],
  },
  {
    key: "course_works",
    label: "Major courses",
    type: "object",
    optional: true,
    blank: () => ({ first_row: [], second_row: [] }),
    fields: [tags("first_row", "Left column"), tags("second_row", "Right column")],
  },
];

const EXPERIENCE_FIELDS = [
  text("title", "Organization", { required: true }),
  url("title_link", "Organization link", { optional: true }),
  ...logoFields,
  daterange("year", "Dates", { placeholder: "Nov 2023 - Present" }),
  text("titleSecond", "Position"),
  text("location", "Location", { optional: true }),
  url("location_link", "Location map link", { optional: true, help: "Required when a location is set." }),
  tags("technologies", "Technologies"),
  strings("involvements", "Involvements", { multiline: true, help: HTML_HELP }),
];

const PROJECT_FIELDS = [
  text("title", "Project name", { required: true }),
  url("title_link", "Project link", { optional: true }),
  daterange("year", "Dates", { placeholder: "Apr 2023 - May 2024" }),
  url("github_link", "GitHub link", { optional: true }),
  text("titleSecond", "Tagline"),
  text("association_with", "Associated with", { help: "Company / team, shown with an info icon. Can be empty." }),
  {
    key: "image_top",
    label: "Show the screenshot above the text",
    type: "bool",
    optional: true,
    help: "Off: screenshot sits beside the text.",
  },
  {
    key: "pictures",
    label: "Screenshots",
    type: "images",
    uploadDir: (item) => `projects/${slugify(item.title)}`,
    help: "The first image is the cover; clicking it on the site opens the gallery.",
  },
  tags("technologies", "Technologies"),
  strings("features", "Key features", { help: HTML_HELP }),
  strings("involvements", "My contribution", {
    multiline: true,
    optional: true,
    help: `${HTML_HELP} Leave empty to hide the “My Contribution” heading.`,
  }),
];

const RESEARCH_FIELDS = [
  text("title", "Title", { required: true }),
  text("info", "Status / venue", { placeholder: "Ongoing Research" }),
  daterange("year", "Dates", { placeholder: "May 2025 - Present" }),
  url("link", "Title link", { help: "Makes the title a link. Can be empty." }),
  url("doi", "DOI link"),
  url("website", "Website link"),
  url("dataset", "Dataset link"),
  longtext("description", "Description"),
  strings("involvements", "Involvements", { multiline: true, help: HTML_HELP }),
];

// --------------------------------------------------------------- sections ---

const summarize = (item) => ({
  title: item.title || "(untitled)",
  subtitle: item.titleSecond || item.info || "",
  meta: item.year || "",
});

export const SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    kind: "form",
    siteRoute: "/about",
    blurb: "Your photo and the details at the top of the home page, in the footer and in the navigation.",
    path: ["profile"],
    fields: [
      {
        key: "photo",
        label: "Profile photo",
        type: "image",
        optional: true,
        uploadDir: () => "",
        help: "Shown in the hero. Upload a new photo or pick one that is already in public/.",
      },
      {
        key: "photoStyle",
        label: "Photo style",
        type: "select",
        options: [
          { value: "frame", label: "Offset frame (default)" },
          { value: "border", label: "Border with mat" },
          { value: "soft", label: "Rounded with soft shadow" },
          { value: "plain", label: "Plain" },
        ],
      },
      {
        key: "photoHover",
        label: "Photo hover colour",
        type: "select",
        help: "What the photo's colours do while the mouse is over it.",
        options: [
          { value: "auto", label: "By theme: dark = black & white until hover, light = colour until hover (default)" },
          { value: "bw", label: "Black & white, full colour on hover" },
          { value: "to-bw", label: "Full colour, black & white on hover" },
          { value: "none", label: "No colour change" },
        ],
      },
      text("name", "Full name", { required: true }),
      text("firstNames", "First names", { help: "Shown in the page header." }),
      text("lastName", "Last name"),
      text("brand", "Short brand", { help: "Shown in the navigation bar." }),
      text("role", "Role"),
      text("institution", "Institution"),
      text("location", "Location"),
      text("leave", "Leave note", { optional: true }),
      text("email", "Email"),
      text("phone", "Phone", { optional: true }),
      {
        key: "cv",
        label: "CV",
        type: "object",
        optional: true,
        blank: () => ({ file: "cv.pdf", downloadAs: "cv.pdf" }),
        fields: [
          text("file", "File in public/", { help: "Replace public/cv.pdf to update the CV itself." }),
          text("downloadAs", "Download name"),
        ],
      },
      {
        key: "links",
        label: "Links",
        type: "object",
        optional: true,
        blank: () => ({}),
        fields: [
          url("lasso", "LASSO Lab page", { optional: true }),
          url("sust", "SUST page", { optional: true }),
          url("scholar", "Google Scholar", { optional: true }),
          url("linkedin", "LinkedIn", { optional: true }),
          url("github", "GitHub", { optional: true }),
        ],
      },
    ],
  },
  {
    id: "about",
    label: "About",
    kind: "form",
    siteRoute: "/about",
    blurb: "The intro paragraphs and research interests on the home page.",
    path: ["about"],
    fields: [
      strings("descriptions", "Intro paragraphs", { multiline: true, itemLabel: "paragraph" }),
      strings("researchInterest", "Research interests", { multiline: true, itemLabel: "interest" }),
    ],
  },
  {
    id: "skills",
    label: "Skills",
    kind: "form",
    siteRoute: "/about",
    blurb: "The four skill groups on the home page. The group names themselves are fixed by the site.",
    path: ["about", "skills"],
    fields: [
      longtext("descriptions", "Intro text", { help: `Shown above the groups. ${HTML_HELP} Can be empty.` }),
      tags("data_science", "AI/ML Tools & Techniques"),
      tags("languages", "Languages"),
      tags("web_dev", "Web Dev"),
      tags("tools", "Others"),
    ],
  },
  {
    id: "organizations",
    label: "Organizations",
    kind: "list",
    siteRoute: "/education",
    blurb: "“Supplementary activities” on the Education page.",
    noun: "organization",
    path: ["about", "organizations", "organization_list"],
    headerPath: ["about", "organizations"],
    headerFields: [longtext("description", "Section intro")],
    fields: ORGANIZATION_FIELDS,
    blank: () => ({ title: "", year: "", titleSecond: "" }),
    summarize,
  },
  {
    id: "education",
    label: "Education",
    kind: "list",
    siteRoute: "/education",
    blurb: "Degrees and schools, newest first.",
    noun: "degree",
    path: ["education"],
    fields: EDUCATION_FIELDS,
    blank: () => ({ title: "", titleSecond: "", year: "" }),
    summarize,
  },
  {
    id: "experience",
    label: "Experience",
    kind: "list",
    siteRoute: "/experience",
    blurb: "Career journey, newest first.",
    noun: "position",
    path: ["experience"],
    fields: EXPERIENCE_FIELDS,
    blank: () => ({ title: "", year: "", titleSecond: "", technologies: [], involvements: [] }),
    summarize,
  },
  {
    id: "projects",
    label: "Projects",
    kind: "list",
    siteRoute: "/project",
    blurb: "Major projects, newest first.",
    noun: "project",
    path: ["projects"],
    fields: PROJECT_FIELDS,
    blank: () => ({
      title: "",
      pictures: [],
      year: "",
      titleSecond: "",
      association_with: "",
      technologies: [],
      features: [],
    }),
    summarize,
  },
  {
    id: "research",
    label: "Published works",
    kind: "list",
    siteRoute: "/about",
    blurb: "“Published works” on the home page, newest first.",
    noun: "research item",
    path: ["researches"],
    fields: RESEARCH_FIELDS,
    blank: () => ({
      title: "",
      info: "",
      doi: "",
      website: "",
      dataset: "",
      link: "",
      year: "",
      description: "",
      involvements: [],
    }),
    summarize,
  },
  {
    id: "raw",
    label: "Raw JSON",
    kind: "raw",
    blurb: "Edit the whole file as text. Anything the forms don't cover can be changed here.",
  },
];

export const LIST_SECTIONS = SECTIONS.filter((s) => s.kind === "list");

export const findSection = (id) => SECTIONS.find((s) => s.id === id);

export const countItems = (data, section) =>
  section.kind === "list" ? (getIn(data, section.path) || []).length : null;

// --------------------------------------------------------------- problems ---

/**
 * Things that would make the public site render badly or crash. They block
 * saving; the admin lists them with a link to the offending item.
 */
export function findProblems(data) {
  const problems = [];
  const add = (section, index, message) => problems.push({ section: section.id, index, message });

  for (const section of LIST_SECTIONS) {
    const list = getIn(data, section.path);
    if (!Array.isArray(list)) continue; // malformed shape: the server's validation reports it on save
    list.forEach((item, i) => {
      if (!item || typeof item !== "object") return;
      const name = item.title ? `“${item.title}”` : `${section.noun} #${i + 1}`;
      if (typeof item.title !== "string" || !item.title.trim()) {
        add(section, i, `${section.noun} #${i + 1} has no title.`);
      }
      if (item.location && !item.location_link) {
        add(section, i, `${name}: a location needs a map link (the site turns it into a link).`);
      }
      (Array.isArray(item.publications) ? item.publications : []).forEach((p, j) => {
        if (!p || !p.title || !p.link) {
          add(section, i, `${name}: research work #${j + 1} needs a title and a link.`);
        }
      });
    });
  }
  return problems;
}
