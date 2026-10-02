import { describe, expect, it } from "vitest";

import { toPublicProjectDto } from "./project-dto";

describe("toPublicProjectDto", () => {
  it("includes only name and websiteUrl", () => {
    const dto = toPublicProjectDto({
      name: "Acme Website",
      websiteUrl: "https://staging.acme.com",
    } as never);

    expect(dto).toEqual({ name: "Acme Website", websiteUrl: "https://staging.acme.com" });
  });

  it("never leaks internal fields present on the source row", () => {
    const dto = toPublicProjectDto({
      name: "Acme Website",
      websiteUrl: "https://staging.acme.com",
      id: "11111111-1111-1111-1111-111111111111",
      organizationId: "org_123",
      clientId: "22222222-2222-2222-2222-222222222222",
      publicKey: "pk_secret_ish",
      status: "active",
    } as never);

    expect(Object.keys(dto)).toEqual(["name", "websiteUrl"]);
  });
});
