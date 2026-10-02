export type FeedbackPayloadInput = {
  projectKey: string;
  message: string;
  pageUrl: string;
  selector?: string;
  elementText?: string;
  screenshotKey?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  userAgent?: string;
};

const MAX_MESSAGE_LENGTH = 5000;
const MAX_SELECTOR_LENGTH = 500;
const MAX_ELEMENT_TEXT_LENGTH = 500;
const MAX_USER_AGENT_LENGTH = 500;

/**
 * Trims and caps every field client-side before it's ever sent — the
 * server independently enforces the same limits (see
 * src/lib/widget/schemas.ts), but capping here keeps the request small
 * and the server's rejection reasons rare in normal use.
 */
export function buildFeedbackPayload(input: FeedbackPayloadInput): FeedbackPayloadInput {
  const payload: FeedbackPayloadInput = {
    projectKey: input.projectKey,
    message: input.message.trim().slice(0, MAX_MESSAGE_LENGTH),
    pageUrl: input.pageUrl,
  };

  if (input.selector) {
    payload.selector = input.selector.slice(0, MAX_SELECTOR_LENGTH);
  }

  if (input.elementText) {
    payload.elementText = input.elementText.slice(0, MAX_ELEMENT_TEXT_LENGTH);
  }

  if (input.screenshotKey) {
    payload.screenshotKey = input.screenshotKey;
  }

  if (typeof input.viewportWidth === "number") {
    payload.viewportWidth = Math.round(input.viewportWidth);
  }

  if (typeof input.viewportHeight === "number") {
    payload.viewportHeight = Math.round(input.viewportHeight);
  }

  if (input.userAgent) {
    payload.userAgent = input.userAgent.slice(0, MAX_USER_AGENT_LENGTH);
  }

  return payload;
}
