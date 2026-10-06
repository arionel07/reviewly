import { render } from "@react-email/components";
import { Resend } from "resend";
import type { ReactNode } from "react";

import { getCanonicalAppUrl } from "@/lib/app-url";
import { logger } from "@/lib/logging/logger";

import { readEmailEnv } from "./env";
import {
  ProjectDecisionEmail,
  projectDecisionText,
  ReviewRequestedEmail,
  reviewRequestedText,
} from "./templates";

export type EmailFailureReason = "no_recipient" | "not_configured" | "provider_error";
export type EmailSendResult =
  | { sent: true; providerMessageId?: string }
  | { sent: false; reason: EmailFailureReason };

type EmailContext = {
  eventType: "review_requested" | "review_approved" | "review_changes_requested";
  projectId: string;
  organizationId: string;
};

async function sendEmail({
  to,
  subject,
  react,
  text,
  context,
}: {
  to: string[];
  subject: string;
  react: ReactNode;
  text: string;
  context: EmailContext;
}): Promise<EmailSendResult> {
  if (to.length === 0) {
    return { sent: false, reason: "no_recipient" };
  }

  let emailEnv;

  try {
    emailEnv = readEmailEnv();
  } catch {
    logger.error({ ...context, reason: "not_configured" }, "Transactional email was not sent");
    return { sent: false, reason: "not_configured" };
  }

  try {
    const html = await render(react);
    const response = await new Resend(emailEnv.apiKey).emails.send({
      from: emailEnv.from,
      to,
      subject,
      html,
      text,
    });

    if (response.error) {
      logger.error({ ...context, reason: "provider_error" }, "Transactional email delivery failed");
      return { sent: false, reason: "provider_error" };
    }

    return { sent: true, providerMessageId: response.data?.id };
  } catch {
    logger.error({ ...context, reason: "provider_error" }, "Transactional email delivery failed");
    return { sent: false, reason: "provider_error" };
  }
}

export async function sendReviewRequestedEmail({
  to,
  projectId,
  organizationId,
  projectName,
  workspaceName,
  reviewUrl,
}: {
  to: string | null;
  projectId: string;
  organizationId: string;
  projectName: string;
  workspaceName: string;
  reviewUrl: string;
}): Promise<EmailSendResult> {
  if (!to?.trim()) {
    return { sent: false, reason: "no_recipient" };
  }

  return sendEmail({
    to: [to.trim()],
    subject: `Review requested: ${projectName}`,
    react: <ReviewRequestedEmail projectName={projectName} workspaceName={workspaceName} reviewUrl={reviewUrl} />,
    text: reviewRequestedText({ projectName, workspaceName, reviewUrl }),
    context: { eventType: "review_requested", projectId, organizationId },
  });
}

export async function sendProjectDecisionEmail({
  to,
  projectId,
  organizationId,
  projectName,
  decision,
}: {
  to: string[];
  projectId: string;
  organizationId: string;
  projectName: string;
  decision: "approved" | "changes_requested";
}): Promise<EmailSendResult> {
  const projectUrl = `${getCanonicalAppUrl()}/projects/${projectId}`;

  return sendEmail({
    to,
    subject: `${decision === "approved" ? "Project approved" : "Changes requested"}: ${projectName}`,
    react: <ProjectDecisionEmail projectName={projectName} projectUrl={projectUrl} decision={decision} />,
    text: projectDecisionText({ projectName, projectUrl, decision }),
    context: { eventType: decision === "approved" ? "review_approved" : "review_changes_requested", projectId, organizationId },
  });
}
