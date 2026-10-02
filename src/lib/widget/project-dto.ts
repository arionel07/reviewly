/**
 * The only shape the widget config endpoint ever returns. Hand-built
 * rather than serializing the Drizzle row directly — organizationId,
 * clientId, publicKey, internal id, and timestamps all stay server-side,
 * even though the current query already selects a minimal column set.
 */
export function toPublicProjectDto(project: { name: string; websiteUrl: string }) {
  return {
    name: project.name,
    websiteUrl: project.websiteUrl,
  };
}

export type PublicProjectDto = ReturnType<typeof toPublicProjectDto>;
