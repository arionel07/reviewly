import { findWidgetScriptElement, parseWidgetBootstrap } from "@/widget/lib/bootstrap";
import { ReviewlyWidget, WIDGET_HOST_TAG } from "@/widget/widget";

declare global {
  interface Window {
    __reviewlyWidgetLoaded?: boolean;
  }
}

function bootstrap(): void {
  // Protects against the embed script being included twice (accidental
  // duplicate <script> tag, a bundler re-running it, etc.) — without
  // this, every init() below would mount a second button/listener set.
  if (window.__reviewlyWidgetLoaded || document.querySelector(WIDGET_HOST_TAG)) {
    return;
  }

  const scriptEl = findWidgetScriptElement(document);

  if (!scriptEl) {
    console.warn("Reviewly widget: could not find its own <script> tag.");
    return;
  }

  const bootstrapConfig = parseWidgetBootstrap(scriptEl);

  if (!bootstrapConfig) {
    console.warn(
      "Reviewly widget: missing data-project-key on the embed <script> tag.",
    );
    return;
  }

  window.__reviewlyWidgetLoaded = true;

  const widget = new ReviewlyWidget(bootstrapConfig);
  void widget.init();
}

try {
  bootstrap();
} catch (error) {
  // The widget must never break the host page, even on an unexpected
  // bootstrap error.
  console.warn("Reviewly widget: failed to initialize.", error);
}
