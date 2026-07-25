import assert from "node:assert/strict";
import { wpAssetUrl } from "./wp-asset-url";

const base = "https://assets.esitef.com";

assert.equal(
  wpAssetUrl(
    "https://esitef.com/online/wp-content/uploads/2024/03/foo.jpg"
  ),
  `${base}/2024/03/foo.jpg`
);

assert.equal(
  wpAssetUrl("https://esitef.com/wp-content/uploads/2022/hero.png"),
  `${base}/2022/hero.png`
);

assert.equal(wpAssetUrl("/img/local.webp"), "/img/local.webp");
assert.equal(wpAssetUrl(null), null);

console.log("wp-asset-url.check.ts OK");
