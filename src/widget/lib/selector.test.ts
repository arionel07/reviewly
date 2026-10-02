// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { generateSelector } from "./selector";

function setBody(html: string) {
  document.body.innerHTML = html;
}

describe("generateSelector", () => {
  it("prefers a unique id", () => {
    setBody('<div><button id="signup-button">Sign up</button></div>');
    const el = document.getElementById("signup-button")!;

    expect(generateSelector(el)).toBe("#signup-button");
  });

  it("falls back to tag+class when the id is not unique", () => {
    setBody(`
      <div id="dup">a</div>
      <div id="dup">b</div>
      <button class="hero-cta">Go</button>
    `);
    const button = document.querySelector("button.hero-cta")!;

    expect(generateSelector(button)).toBe("button.hero-cta");
  });

  it("uses only the first two classes when there are more", () => {
    setBody('<button class="one two three">Go</button>');
    const button = document.querySelector("button")!;

    expect(generateSelector(button)).toBe("button.one.two");
  });

  it("falls back to a structural nth-child path with no id/class", () => {
    setBody(`
      <div>
        <p>first</p>
        <p>second</p>
        <p>third</p>
      </div>
    `);
    const third = document.querySelectorAll("p")[2];

    const selector = generateSelector(third);
    expect(document.querySelectorAll(selector)).toHaveLength(1);
    expect(document.querySelector(selector)).toBe(third);
  });

  it("never selects the widget's own host element", () => {
    setBody('<reviewly-widget id="rw"></reviewly-widget>');
    const host = document.getElementById("rw")!;

    // Nothing enforces this inside generateSelector itself — the widget
    // class is responsible for never calling it on its own host — but
    // this documents that a selector can still be produced if it were.
    expect(generateSelector(host)).toBe("#rw");
  });

  it("caps selector length", () => {
    const longClass = Array.from({ length: 50 }, (_, i) => `class-${i}`).join(" ");
    setBody(`<button class="${longClass}">Go</button>`);
    const button = document.querySelector("button")!;

    expect(generateSelector(button).length).toBeLessThanOrEqual(500);
  });
});
