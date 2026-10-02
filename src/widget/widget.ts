import { fetchProjectConfig, submitFeedback, WidgetApiError, type ProjectConfig } from "@/widget/api";
import { buildFeedbackPayload } from "@/widget/lib/payload";
import { generateSelector } from "@/widget/lib/selector";
import { extractElementText } from "@/widget/lib/text";
import { widgetStyles } from "@/widget/styles";

export const WIDGET_HOST_TAG = "reviewly-widget";

type SelectedElementContext = {
  selector: string;
  elementText: string;
  rect: DOMRect;
};

type ComposerState = "idle" | "pending" | "error" | "success";

export type ReviewlyWidgetOptions = {
  projectKey: string;
  apiBaseUrl: string;
};

/**
 * Owns the widget's entire lifecycle: one host element + shadow root per
 * instance, a small set of bound listeners that get added and removed
 * as a unit (never anonymous closures that can't be targeted later),
 * and no mutation of the host page's own DOM or styles.
 */
export class ReviewlyWidget {
  private readonly projectKey: string;
  private readonly apiBaseUrl: string;
  private config: ProjectConfig | null = null;

  private host: HTMLElement | null = null;
  private shadow: ShadowRoot | null = null;
  private buttonEl: HTMLButtonElement | null = null;
  private overlayEl: HTMLDivElement | null = null;
  private composerBackdrop: HTMLDivElement | null = null;

  private inspecting = false;
  private selectedContext: SelectedElementContext | null = null;
  private composerState: ComposerState = "idle";
  private composerError: string | null = null;

  constructor(options: ReviewlyWidgetOptions) {
    this.projectKey = options.projectKey;
    this.apiBaseUrl = options.apiBaseUrl;

    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handleInspectClick = this.handleInspectClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  async init(): Promise<void> {
    this.mountHost();

    try {
      this.config = await fetchProjectConfig(this.apiBaseUrl, this.projectKey);
    } catch (error) {
      this.logDevError("Reviewly widget: could not load project config", error);
      // A button that can never successfully open a composer isn't
      // useful to show — fail safely by tearing down instead of leaving
      // a broken control on the host page.
      this.destroy();
      return;
    }

    this.renderButton();
  }

  private mountHost(): void {
    const host = document.createElement(WIDGET_HOST_TAG);
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.width = "0";
    host.style.height = "0";

    const shadow = host.attachShadow({ mode: "open" });
    const styleEl = document.createElement("style");
    styleEl.textContent = widgetStyles;
    shadow.appendChild(styleEl);

    document.body.appendChild(host);

    this.host = host;
    this.shadow = shadow;
  }

  private renderButton(): void {
    if (!this.shadow) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rw-button";
    button.textContent = "Feedback";
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", this.handleButtonClick);

    this.shadow.appendChild(button);
    this.buttonEl = button;
  }

  private handleButtonClick(): void {
    if (this.inspecting) {
      this.disableInspectMode();
    } else {
      this.enableInspectMode();
    }
  }

  enableInspectMode(): void {
    if (this.inspecting || !this.shadow) return;
    this.inspecting = true;

    if (this.buttonEl) {
      this.buttonEl.dataset.active = "true";
      this.buttonEl.textContent = "Cancel";
      this.buttonEl.setAttribute("aria-pressed", "true");
    }

    const overlay = document.createElement("div");
    overlay.className = "rw-overlay";
    overlay.style.display = "none";
    this.shadow.appendChild(overlay);
    this.overlayEl = overlay;

    document.addEventListener("pointermove", this.handlePointerMove, true);
    document.addEventListener("click", this.handleInspectClick, true);
    document.addEventListener("keydown", this.handleKeyDown, true);
  }

  disableInspectMode(): void {
    if (!this.inspecting) return;
    this.inspecting = false;

    document.removeEventListener("pointermove", this.handlePointerMove, true);
    document.removeEventListener("click", this.handleInspectClick, true);
    document.removeEventListener("keydown", this.handleKeyDown, true);

    this.overlayEl?.remove();
    this.overlayEl = null;

    if (this.buttonEl) {
      this.buttonEl.dataset.active = "false";
      this.buttonEl.textContent = "Feedback";
      this.buttonEl.setAttribute("aria-pressed", "false");
    }
  }

  private isWidgetElement(target: EventTarget | null): boolean {
    return target instanceof Node && target === this.host;
  }

  private handlePointerMove(event: PointerEvent): void {
    if (!this.overlayEl) return;

    const target = document.elementFromPoint(event.clientX, event.clientY);

    if (!target || this.isWidgetElement(target) || target === document.documentElement) {
      this.overlayEl.style.display = "none";
      return;
    }

    const rect = target.getBoundingClientRect();
    this.overlayEl.style.display = "block";
    this.overlayEl.style.top = `${rect.top}px`;
    this.overlayEl.style.left = `${rect.left}px`;
    this.overlayEl.style.width = `${rect.width}px`;
    this.overlayEl.style.height = `${rect.height}px`;
  }

  private handleInspectClick(event: MouseEvent): void {
    const target = document.elementFromPoint(event.clientX, event.clientY);

    if (!target || this.isWidgetElement(target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.selectElement(target);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      if (this.composerBackdrop) {
        this.closeComposer();
      } else {
        this.disableInspectMode();
      }
    }
  }

  private selectElement(element: Element): void {
    const rect = element.getBoundingClientRect();

    this.selectedContext = {
      selector: generateSelector(element, document),
      elementText: extractElementText(element),
      rect,
    };

    this.disableInspectMode();
    this.openComposer();
  }

  private openComposer(): void {
    if (!this.shadow || this.composerBackdrop) return;

    this.composerState = "idle";
    this.composerError = null;
    this.renderComposer();
  }

  closeComposer(): void {
    this.composerBackdrop?.remove();
    this.composerBackdrop = null;
    this.selectedContext = null;
    this.composerState = "idle";
    this.composerError = null;
  }

  private renderComposer(): void {
    if (!this.shadow) return;

    this.composerBackdrop?.remove();

    const backdrop = document.createElement("div");
    backdrop.className = "rw-composer-backdrop";
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        this.closeComposer();
      }
    });

    const panel = document.createElement("div");
    panel.className = "rw-composer";

    const heading = document.createElement("h2");
    heading.textContent = "Leave feedback";
    panel.appendChild(heading);

    if (this.selectedContext?.selector) {
      const target = document.createElement("div");
      target.className = "rw-composer-target";
      target.textContent = `Selected: ${this.selectedContext.selector}`;
      panel.appendChild(target);
    }

    const textareaId = "rw-composer-message";
    const label = document.createElement("label");
    label.className = "rw-sr-only";
    label.setAttribute("for", textareaId);
    label.textContent = "Your feedback";
    panel.appendChild(label);

    const textarea = document.createElement("textarea");
    textarea.id = textareaId;
    textarea.placeholder = "What should change here?";
    panel.appendChild(textarea);

    const statusEl = document.createElement("div");
    panel.appendChild(statusEl);

    const actions = document.createElement("div");
    actions.className = "rw-composer-actions";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "rw-btn-secondary";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", () => this.closeComposer());

    const sendButton = document.createElement("button");
    sendButton.type = "button";
    sendButton.className = "rw-btn-primary";
    sendButton.textContent = "Send";
    sendButton.addEventListener("click", () => {
      void this.handleSubmit(textarea.value, { sendButton, cancelButton, textarea, statusEl });
    });

    actions.appendChild(cancelButton);
    actions.appendChild(sendButton);
    panel.appendChild(actions);

    backdrop.appendChild(panel);
    this.shadow.appendChild(backdrop);
    this.composerBackdrop = backdrop;

    textarea.focus();
  }

  private async handleSubmit(
    message: string,
    elements: {
      sendButton: HTMLButtonElement;
      cancelButton: HTMLButtonElement;
      textarea: HTMLTextAreaElement;
      statusEl: HTMLDivElement;
    },
  ): Promise<void> {
    const trimmed = message.trim();

    if (!trimmed) {
      this.renderComposerStatus(elements.statusEl, "error", "Enter some feedback first.");
      return;
    }

    elements.sendButton.disabled = true;
    elements.cancelButton.disabled = true;
    elements.textarea.disabled = true;
    this.renderComposerStatus(elements.statusEl, "pending", "Sending…");

    try {
      await this.submitFeedback(trimmed);
      this.renderComposerStatus(elements.statusEl, "success", "Feedback sent");
      window.setTimeout(() => this.closeComposer(), 1200);
    } catch (error) {
      this.logDevError("Reviewly widget: failed to submit feedback", error);
      const message =
        error instanceof WidgetApiError
          ? error.message
          : "Could not send feedback. Please try again.";
      this.renderComposerStatus(elements.statusEl, "error", message);
      elements.sendButton.disabled = false;
      elements.cancelButton.disabled = false;
      elements.textarea.disabled = false;
    }
  }

  private renderComposerStatus(
    statusEl: HTMLDivElement,
    state: ComposerState,
    text: string,
  ): void {
    this.composerState = state;
    statusEl.textContent = text;
    statusEl.className =
      state === "error"
        ? "rw-composer-error"
        : state === "success"
          ? "rw-composer-success"
          : "";
  }

  async submitFeedback(message: string): Promise<void> {
    const payload = buildFeedbackPayload({
      projectKey: this.projectKey,
      message,
      pageUrl: window.location.href,
      selector: this.selectedContext?.selector,
      elementText: this.selectedContext?.elementText,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      userAgent: navigator.userAgent,
    });

    await submitFeedback(this.apiBaseUrl, payload);
  }

  private logDevError(message: string, error: unknown): void {
    if (typeof console !== "undefined") {
      console.warn(message, error);
    }
  }

  destroy(): void {
    this.disableInspectMode();
    this.closeComposer();
    this.host?.remove();
    this.host = null;
    this.shadow = null;
    this.buttonEl = null;
  }
}
