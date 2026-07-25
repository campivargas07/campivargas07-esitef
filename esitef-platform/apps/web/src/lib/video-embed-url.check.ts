import assert from "node:assert/strict";
import { toVideoEmbedUrl } from "./video-embed-url";

assert.equal(
  toVideoEmbedUrl("https://vimeo.com/535671745?share=copy"),
  "https://player.vimeo.com/video/535671745"
);
assert.equal(
  toVideoEmbedUrl("https://vimeo.com/454851689/f96f4abeca"),
  "https://player.vimeo.com/video/454851689?h=f96f4abeca"
);
assert.equal(
  toVideoEmbedUrl("https://player.vimeo.com/video/123"),
  "https://player.vimeo.com/video/123"
);
assert.equal(
  toVideoEmbedUrl("https://www.youtube.com/watch?v=abc123"),
  "https://www.youtube.com/embed/abc123"
);
assert.equal(toVideoEmbedUrl(null), null);

console.log("video-embed-url.check.ts OK");
