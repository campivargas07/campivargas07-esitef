import { render } from "@react-email/render";
import type { ReactElement } from "react";

export async function renderEmailTemplate(element: ReactElement) {
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return { html, text };
}
