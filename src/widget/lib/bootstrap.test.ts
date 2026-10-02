// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { findWidgetScriptElement, parseWidgetBootstrap } from "./bootstrap";

describe("parseWidgetBootstrap", () => {
  it("reads the project key and derives the API base from the script src", () => {
    const scriptEl = {
      dataset: { projectKey: "pk_abc123" },
      src: "https://reviewly.app/widget/widget.js",
    };

    expect(parseWidgetBootstrap(scriptEl)).toEqual({
      projectKey: "pk_abc123",
      apiBaseUrl: "https://reviewly.app",
    });
  });

  it("trims whitespace around the project key", () => {
    const scriptEl = {
      dataset: { projectKey: "  pk_abc123  " },
      src: "http://localhost:3000/widget/widget.js",
    };

    expect(parseWidgetBootstrap(scriptEl)?.projectKey).toBe("pk_abc123");
  });

  it("returns null when the project key is missing", () => {
    const scriptEl = { dataset: {}, src: "http://localhost:3000/widget/widget.js" };

    expect(parseWidgetBootstrap(scriptEl)).toBeNull();
  });

  it("returns null when the project key is empty/whitespace", () => {
    const scriptEl = { dataset: { projectKey: "   " }, src: "http://localhost:3000/widget/widget.js" };

    expect(parseWidgetBootstrap(scriptEl)).toBeNull();
  });

  it("returns null when the script src is not a valid URL", () => {
    const scriptEl = { dataset: { projectKey: "pk_abc123" }, src: "" };

    expect(parseWidgetBootstrap(scriptEl)).toBeNull();
  });
});

describe("findWidgetScriptElement", () => {
  it("falls back to the last script tag with data-project-key", () => {
    document.body.innerHTML = `
      <script data-project-key="pk_old"></script>
      <script data-project-key="pk_new"></script>
    `;

    const found = findWidgetScriptElement(document);
    expect(found?.getAttribute("data-project-key")).toBe("pk_new");
  });

  it("returns null when no matching script tag exists", () => {
    document.body.innerHTML = "<script></script>";

    expect(findWidgetScriptElement(document)).toBeNull();
  });
});
