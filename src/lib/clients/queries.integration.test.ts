import { randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Exercises tenant scoping against a real Postgres database, the same way
 * the app itself does — these are the security-sensitive paths the task
 * asked not to test only through hidden navigation. Skipped (not failed)
 * when no DATABASE_URL is configured, since importing "@/db" throws at
 * module load otherwise; everything below is dynamically imported inside
 * beforeAll so that import never happens when the suite is skipped.
 */
describe.skipIf(!process.env.DATABASE_URL)(
  "client tenant scoping (integration)",
  () => {
    let db: typeof import("@/db").db;
    let schema: typeof import("@/db/schema");
    let queries: typeof import("./queries");

    let organizationAId: string;
    let organizationBId: string;

    beforeAll(async () => {
      [{ db }, schema, queries] = await Promise.all([
        import("@/db"),
        import("@/db/schema"),
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
    });

    afterAll(async () => {
      // Cascades to any clients (and their projects) left over from a
      // failed assertion.
      await db
        .delete(schema.organization)
        .where(inArray(schema.organization.id, [organizationAId, organizationBId]));
    });

    it("lets a workspace read, update, and delete its own client", async () => {
      const client = await queries.createClient(organizationAId, {
        name: "Acme Inc.",
        email: "john@acme.com",
      });

      const read = await queries.getClient(client.id, organizationAId);
      expect(read?.id).toBe(client.id);

      const updated = await queries.updateClient(client.id, organizationAId, {
        name: "Acme Incorporated",
      });
      expect(updated?.name).toBe("Acme Incorporated");
      expect(updated?.email).toBeNull();

      const deleted = await queries.deleteClient(client.id, organizationAId);
      expect(deleted?.id).toBe(client.id);

      expect(await queries.getClient(client.id, organizationAId)).toBeNull();
    });

    it("hides another workspace's client from a cross-tenant read", async () => {
      const client = await queries.createClient(organizationAId, {
        name: "Workspace A Client",
      });

      const crossTenantRead = await queries.getClient(
        client.id,
        organizationBId,
      );

      expect(crossTenantRead).toBeNull();

      const ownerRead = await queries.getClient(client.id, organizationAId);
      expect(ownerRead?.id).toBe(client.id);
    });

    it("never updates another workspace's client", async () => {
      const client = await queries.createClient(organizationAId, {
        name: "Workspace A Client",
      });

      const crossTenantUpdate = await queries.updateClient(
        client.id,
        organizationBId,
        { name: "Hijacked" },
      );

      expect(crossTenantUpdate).toBeNull();

      const unchanged = await queries.getClient(client.id, organizationAId);
      expect(unchanged?.name).toBe("Workspace A Client");
    });

    it("never deletes another workspace's client", async () => {
      const client = await queries.createClient(organizationAId, {
        name: "Workspace A Client",
      });

      const crossTenantDelete = await queries.deleteClient(
        client.id,
        organizationBId,
      );

      expect(crossTenantDelete).toBeNull();

      const stillExists = await queries.getClient(client.id, organizationAId);
      expect(stillExists?.id).toBe(client.id);
    });

    it("scopes listClients to the given organization only", async () => {
      await queries.createClient(organizationAId, { name: "A Client 1" });
      await queries.createClient(organizationAId, { name: "A Client 2" });
      await queries.createClient(organizationBId, { name: "B Client 1" });

      const workspaceAClients = await queries.listClients(organizationAId);
      const workspaceBClients = await queries.listClients(organizationBId);

      expect(
        workspaceAClients.every((c) => c.organizationId === organizationAId),
      ).toBe(true);
      expect(
        workspaceBClients.every((c) => c.organizationId === organizationBId),
      ).toBe(true);
      expect(
        workspaceAClients.some((c) => c.organizationId === organizationBId),
      ).toBe(false);
    });
  },
);
