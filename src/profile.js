// Personal details (hero, footer, navigation). The admin edits them via src/data.json "profile".
// Keeping them in one place makes them easy to change later.
import data from "./data.json";

const defaults = {
  name: "Mahfuzur Rahman Emon",
  firstNames: "Mahfuzur Rahman",
  lastName: "Emon",
  brand: "m.r.e.",
  role: "M.Sc. Student, LASSO Lab",
  institution: "University of Calgary",
  location: "Calgary, Alberta, Canada",
  leave: "On leave from SUST, where I am a Lecturer at IICT",
  photo: "emon_dp.jpeg",
  photoHover: "auto", // auto | bw | to-bw | none
  photoStyle: "frame", // frame | border | soft | plain
  email: "emon-iict@sust.edu",
  phone: "+8801521702334",
  cv: { file: "cv.pdf", downloadAs: "emon_cv.pdf" },
  links: {
    lasso: "https://lasso-lab.com/team/mahfuzur-emon",
    sust: "https://www.sust.edu/institutes/iict/faculty/emon-iict@sust.edu",
    scholar: "https://scholar.google.com/citations?user=ugFyqqEAAAAJ&hl=en",
    linkedin: "https://www.linkedin.com/in/emon-swe-sust/",
    github: "https://github.com/emon-swe-sust",
  },
};

// Editable in the admin (Profile section); anything missing falls back to the defaults above.
const saved = data.profile || {};
const profile = {
  ...defaults,
  ...saved,
  cv: { ...defaults.cv, ...(saved.cv || {}) },
  links: { ...defaults.links, ...(saved.links || {}) },
};

export default profile;
