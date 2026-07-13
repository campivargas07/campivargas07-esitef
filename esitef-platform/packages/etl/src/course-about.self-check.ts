import assert from "node:assert/strict";
import { resolveCourseAboutContent } from "./course-about";

const about = resolveCourseAboutContent({
  postContent: '<h3><a href="/courses/foo/">Duplicate</a></h3>',
  postExcerpt: "",
  benefits: "25 hrs. Formativas\\r\\n3 hrs. Teóricas",
  hasLegacyBuilder: true,
});

assert.match(about, /<p>25 hrs\. Formativas<\/p>/);
assert.match(about, /<p>3 hrs\. Teóricas<\/p>/);
assert.doesNotMatch(about, /Duplicate/);

console.log("course-about.self-check ok");
