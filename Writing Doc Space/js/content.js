/* ================================================================
   DATA INTELLIGENCE CODEX — CONTENT
   ----------------------------------------------------------------
   Everything you'd ever want to edit lives in this one file.
   app.js only ever reads from these objects — you never need to
   touch app.js or styles.css just to add or change content.
   ================================================================ */

/* ----------------------------------------------------------------
   HOW TO ADD A NEW DATASET
   ----------------------------------------------------------------
   1. Copy one of the objects in the DATASETS array below (or start
      from the commented shape if the array is empty).
   2. Give it a unique "id" — used in the URL, e.g. #/dataset/my-id.
   3. Fill in title, description, category, tools, status, year.
   4. Fill "overview" and "objective" as plain strings.
   5. Add as many "cleaningSteps" as you did — each is a
      { title, why, code, lang } object. "code" is optional.
   6. Add as many "analysis" entries as you want — each is a
      { question, approach, code, lang, result, insight } object.
      "code" and "result" are optional.
   7. Save the file. The Datasets grid and this dataset's detail
      page update automatically — nothing else needs to change.
   ML_PROJECTS and AI_PROJECTS follow the same idea — see the
   comments above each.
------------------------------------------------------------------- */

const DATASETS = [
  // {
  //   id: "unique-id",
  //   title: "",
  //   description: "",
  //   category: "",       // e.g. "DATA SCIENCE / EDA"
  //   tools: [],           // e.g. ["Python","Pandas","Matplotlib"]
  //   status: "complete" | "in-progress",
  //   year: "2026",
  //   overview: "",
  //   objective: "",
  //   cleaningSteps: [ { title, why, code, lang } ],
  //   analysis: [ { question, approach, code, lang, result, insight } ]
  // }
];

/* ----------------------------------------------------------------
   HOW TO ADD A NEW ML PROJECT
   ----------------------------------------------------------------
   Each entry needs: id, title, description, category, tools,
   status, year, problem, datasetNote, preprocessing[],
   modelChoice { model, why }, evaluation { metric, result,
   interpretation }, futureWork. preprocessing[] follows the same
   { title, why, code, lang } shape used in cleaningSteps above.
------------------------------------------------------------------- */
const ML_PROJECTS = [
  // Add ML project objects here — see comment above.
];

/* ----------------------------------------------------------------
   HOW TO ADD A NEW AI ENGINEERING PROJECT
   ----------------------------------------------------------------
   Same idea again: id, title, description, category, tools,
   status, year, problem, architecture[] (same { title, why, code,
   lang } shape), evaluation (plain string), futureWork.
------------------------------------------------------------------- */
const AI_PROJECTS = [
  // Add AI Engineering project objects here once ready.
];

const SOCIAL_LINKS = [
  // { label: "", sub: "", href: "", icon: "github" | "linkedin" }
];

const NOW_LEARNING = [
  // { title: "", note: "" }
];

const ABOUT_CONTENT = {
  // sections: [ { heading: "", body: "" } ]
  sections: []
};
