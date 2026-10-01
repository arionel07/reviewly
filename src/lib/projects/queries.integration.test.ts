import { randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Exercises tenant scoping (including cross-organization client
 * assignment, which the create/update Server Actions guard against)
 * against a real Postgres database. Skipped (not failed) when no
 * DATABASE_URL is configured, since importing "@/db" throws at module
 * load otherwise; everything below is dynamically imported inside
 * beforeAll so that import never happens when the suite is skipped.
 */
describe.skipIf(!process.env.DATABASE_URL)(
  "project tenant scoping (integration)",
  () => {
    let db: typeof import("@/db").db;
    let schema: typeof import("@/db/schema");
    let clientQueries: typeof import("@/lib/clients/queries");
    let queries: typeof import("./queries");

    let organizationAId: string;
    let organizationBId: string;
    let clientAId: string;
    let clientBId: string;

    beforeAll(async () => {
      [{ db }, schema, clientQueries, queries] = await Promise.all([
        import("@/db"),
        import("@/db/schema"),
        import("@/lib/clients/queries"),
        import("./queries"),
      ]);

      organizationAId = randomUUID();
      organizationBId = randomUUID();

      await db.insert(schema.organization).values([
        {
          id: organizationAId,
          name: "Workspace A",
          slug: `workspace-a-${organizationAId}`,
          createdAt: new Date(),
        },
        {
          id: organizationBId,
          name: "Workspace B",
          slug: `workspace-b-${organizationBId}`,
          createdAt: new Date(),
        },
      ]);

      const clientA = await clientQueries.createClient(organizationAId, {
        name: "Client A",
      });
      const clientB = await clientQueries.createClient(organizationBId, {
        name: "Client B",
      });
      clientAId = clientA.id;
      clientBId = clientB.id;
    });

    afterAll(async () => {
      // Cascades to any clients/projects left over from a failed assertion.
      await db
        .delete(schema.organization)
        .where(inArray(schema.organization.id, [organizationAId, organizationBId]));
    });

    function projectInput(overrides: Partial<{ name: string; clientId: string; websiteUrl: string; status: "draft" | "active" | "completed" | "archived" }> = {}) {
      return {
        name: "Acme Website Redesign",
        clientId: clientAId,
        websiteUrl: "https://staging.acme.com",
        status: "draft" as const,
        ...overrides,
      };
    }

    it("lets a workspace read, update, and delete its own project", async () => {
      const created = await queries.createProject(organizationAId, {
        ...projectInput(),
        publicKey: `pk_${randomUUID()}`,
      });

      const read = await queries.getProject(created.id, organizationAId);
      expect(read?.id).toBe(created.id);
      expect(read?.clientName).toBe("Client A");

      const updated = await queries.updateProject(created.id, organizationAId, {
        ...projectInput({ name: "Renamed Project", status: "active" }),
      });
      expect(updated?.name).toBe("Renamed Project");
      expect(updated?.status).toBe("active");

      const deleted = await queries.deleteProject(created.id, organizationAId);
      expect(deleted?.id).toBe(created.id);

      expect(await queries.getProject(created.id, organizationAId)).toBeNull();
    });

    it("hides another workspace's project from a cross-tenant read", async () => {
      const created = await queries.createProject(organizationAId, {
        ...projectInput(),
        publicKey: `pk_${randomUUID()}`,
      });

      const crossTenantRead = await queries.getProject(created.id, organizationBId);
      expect(crossTenantRead).toBeNull();

      const ownerRead = await queries.getProject(created.id, organizationAId);
      expect(ownerRead?.id).toBe(created.id);
    });

    it("never updates another workspace's project", async () => {
      const created = await queries.createProject(organizationAId, {
        ...projectInput(),
        publicKey: `pk_${randomUUID()}`,
      });

      const crossTenantUpdate = await queries.updateProject(created.id, organizationBId, {
        ...projectInput({ name: "Hijacked" }),
      });
      expect(crossTenantUpdate).toBeNull();

      const unchanged = await queries.getProject(created.id, organizationAId);
      expect(unchanged?.name).toBe("Acme Website Redesign");
    });

    it("never deletes another workspace's project", async () => {
      const created = await queries.createProject(organizationAId, {
        ...projectInput(),
        publicKey: `pk_${randomUUID()}`,
      });

      const crossTenantDelete = await queries.deleteProject(created.id, organizationBId);
      expect(crossTenantDelete).toBeNull();

      const stillExists = await queries.getProject(created.id, organizationAId);
      expect(stillExists?.id).toBe(created.id);
    });

    it("rejects assigning a foreign-workspace client (what the create/update actions enforce)", async () => {
      // queries.createProject/updateProject trust the clientId they're
      // given — the actual protection lives in the Server Action, which
      // checks the client belongs to the organization via getClient
      // before ever calling these. This test exercises that exact check.
      const clientBInWorkspaceA = await clientQueries.getClient(
        clientBId,
        organizationAId,
      );

      expect(clientBInWorkspaceA).toBeNull();

      const clientAInWorkspaceA = await clientQueries.getClient(
        clientAId,
        organizationAId,
      );

      expect(clientAInWorkspaceA?.id).toBe(clientAId);
    });

    it("scopes listProjects to the given organization only", async () => {
      await queries.createProject(organizationAId, {
        ...projectInput(),
        publicKey: `pk_${randomUUID()}`,
      });
      await queries.createProject(organizationBId, {
        ...projectInput({ clientId: clientBId }),
        publicKey: `pk_${randomUUID()}`,
      });

      const workspaceAProjects = await queries.listProjects(organizationAId);
      const workspaceBProjects = await queries.listProjects(organizationBId);

      expect(workspaceAProjects.every((p) => p.clientId === clientAId)).toBe(true);
      expect(workspaceBProjects.every((p) => p.clientId === clientBId)).toBe(true);
    });

    it("scopes listProjectsForClient by organization, not just clientId", async () => {
      await queries.createProject(organizationAId, {
        ...projectInput(),
        publicKey: `pk_${randomUUID()}`,
      });

      const forOwner = await queries.listProjectsForClient(clientAId, organizationAId);
      const forOtherOrg = await queries.listProjectsForClient(clientAId, organizationBId);

      expect(forOwner.length).toBeGreaterThan(0);
      expect(forOtherOrg).toEqual([]);
    });
  },
);
