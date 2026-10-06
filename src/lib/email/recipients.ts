import { eq } from "drizzle-orm";

import { db } from "@/db";
import { member, user } from "@/db/schema";
import { deduplicateEmailAddresses } from "./recipient-utils";

export { deduplicateEmailAddresses } from "./recipient-utils";

/**
 * Resolves current workspace members at send time. Recipients are not
 * snapshotted because this is a delivery concern, not business state.
 */
export async function getWorkspaceEmailRecipients(organizationId: string): Promise<string[]> {
  const rows = await db
    .select({ email: user.email })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, organizationId));

  return deduplicateEmailAddresses(rows.map((row) => row.email));
}
