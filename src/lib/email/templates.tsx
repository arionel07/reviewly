import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const styles = {
  body: { backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif", color: "#0f172a" },
  container: { backgroundColor: "#ffffff", margin: "32px auto", padding: "32px", maxWidth: "560px" },
  heading: { fontSize: "24px", lineHeight: "1.25", margin: "0 0 16px" },
  text: { fontSize: "16px", lineHeight: "1.5" },
  muted: { color: "#64748b", fontSize: "14px", lineHeight: "1.5" },
  button: { backgroundColor: "#0f172a", borderRadius: "6px", color: "#ffffff", padding: "12px 18px" },
};

function Layout({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={{ ...styles.muted, margin: "0 0 24px", fontWeight: "700" }}>Reviewly</Text>
          {children}
          <Hr />
          <Text style={styles.muted}>This is a transactional message from Reviewly.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export function ReviewRequestedEmail({
  projectName,
  workspaceName,
  reviewUrl,
}: {
  projectName: string;
  workspaceName: string;
  reviewUrl: string;
}) {
  return (
    <Layout preview={`Review requested: ${projectName}`}>
      <Heading style={styles.heading}>Review requested</Heading>
      <Text style={styles.text}>
        {workspaceName} has asked you to review <strong>{projectName}</strong>.
      </Text>
      <Section style={{ margin: "24px 0" }}>
        <Button href={reviewUrl} style={styles.button}>Review project</Button>
      </Section>
      <Text style={styles.muted}>
        This link provides access to this project review. If the button does not work, use this
        URL:
      </Text>
      <Link href={reviewUrl} style={{ ...styles.muted, wordBreak: "break-all" }}>{reviewUrl}</Link>
    </Layout>
  );
}

export function ProjectDecisionEmail({
  projectName,
  projectUrl,
  decision,
}: {
  projectName: string;
  projectUrl: string;
  decision: "approved" | "changes_requested";
}) {
  const approved = decision === "approved";

  return (
    <Layout preview={`${approved ? "Project approved" : "Changes requested"}: ${projectName}`}>
      <Heading style={styles.heading}>{approved ? "Project approved" : "Changes requested"}</Heading>
      <Text style={styles.text}>
        The client {approved ? "approved" : "requested another revision for"} <strong>{projectName}</strong>.
      </Text>
      <Section style={{ margin: "24px 0" }}>
        <Button href={projectUrl} style={styles.button}>Open project</Button>
      </Section>
      <Text style={styles.muted}>
        If the button does not work, use this URL:
      </Text>
      <Link href={projectUrl} style={{ ...styles.muted, wordBreak: "break-all" }}>{projectUrl}</Link>
    </Layout>
  );
}

export function reviewRequestedText({
  projectName,
  workspaceName,
  reviewUrl,
}: {
  projectName: string;
  workspaceName: string;
  reviewUrl: string;
}): string {
  return [
    "Review requested",
    "",
    `${workspaceName} has asked you to review ${projectName}.`,
    "",
    `Review project: ${reviewUrl}`,
    "",
    "This link provides access to this project review.",
  ].join("\n");
}

export function projectDecisionText({
  projectName,
  projectUrl,
  decision,
}: {
  projectName: string;
  projectUrl: string;
  decision: "approved" | "changes_requested";
}): string {
  const approved = decision === "approved";

  return [
    approved ? "Project approved" : "Changes requested",
    "",
    `The client ${approved ? "approved" : "requested another revision for"} ${projectName}.`,
    "",
    `Open project: ${projectUrl}`,
  ].join("\n");
}
