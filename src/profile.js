// Personal details that appear outside src/data.json (hero, footer, navigation).
// Keeping them in one place makes them easy to change later.
import scholar from "./scholar.json";

const profile = {
  name: "Mahfuzur Rahman Emon",
  firstNames: "Mahfuzur Rahman",
  lastName: "Emon",
  brand: "m.r.e.",
  role: "M.Sc. Student, LASSO Lab",
  institution: "University of Calgary",
  location: "Calgary, Alberta, Canada",
  leave: "On leave from SUST, where I am a Lecturer at IICT",
  photo: "emon_dp.jpeg",
  email: "emon-iict@sust.edu",
  phone: "+8801521702334",
  cv: { file: "cv.pdf", downloadAs: "emon_cv.pdf" },
  // Numbers shown in the bar under the hero buttons. Publications and
  // citations come from src/scholar.json, which a daily job refreshes from
  // Google Scholar (see .github/workflows/scholar.yml). The other two are
  // typed here. Give an item an `href` to make it a link.
  stats: [
    { value: String(scholar.publications), label: "Publications", href: "https://scholar.google.com/citations?user=ugFyqqEAAAAJ&hl=en" },
    { value: String(scholar.citations), label: "Citations", href: "https://scholar.google.com/citations?user=ugFyqqEAAAAJ&hl=en" },
    { value: "1", label: "Research award" },
    { value: "4", label: "Ongoing research" },
  ],
  links: {
    lasso: "https://lasso-lab.com/team/mahfuzur-emon",
    sust: "https://www.sust.edu/institutes/iict/faculty/emon-iict@sust.edu",
    scholar: "https://scholar.google.com/citations?user=ugFyqqEAAAAJ&hl=en",
    linkedin: "https://www.linkedin.com/in/emon-swe-sust/",
    github: "https://github.com/emon-swe-sust",
  },
};

export default profile;
