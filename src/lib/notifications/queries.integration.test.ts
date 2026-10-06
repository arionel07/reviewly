import { randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { NotificationDto } from "./queries";

describe.skipIf(!process.env.DATABASE_URL)("notifications (integration)", () => {
  let db: typeof import("@/db").db;
  let schema: typeof import("@/db/schema");
  let queries: typeof import("./queries");
  let insertNotification: typeof import("./queries").insertNotification;

  let organizationA: string;
  let organizationB: string;
  let userA: string;
  let userB: string;
  let notificationA: string;
  let notificationASecond: string;
  let notificationB: string;

  beforeAll(async () => {
    [db, schema, queries] = await Promise.all([
      import("@/db").then((module) => module.db),
      import("@/db/schema"),
      import("./queries"),
    ]);
    insertNotification = queries.insertNotification;

    organizationA = randomUUID();
    organizationB = randomUUID();
    userA = randomUUID();
    userB = randomUUID();

    await db.insert(schema.organization).values([
      {
        id: organizationA,
        name: "Notifications A",
        slug: `notifications-a-${organizationA}`,
        createdAt: new Date(),
      },
      {
        id: organizationB,
        name: "Notifications B",
        slug: `notifications-b-${organizationB}`,
        createdAt: new Date(),
      },
    ]);

    await db.insert(schema.user).values([
      {
        id: userA,
        name: "User A",
        email: `notifications-a-${userA}@example.com`,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: userB,
        name: "User B",
        email: `notifications-b-${userB}@example.com`,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await db.insert(schema.member).values([
      {
        id: randomUUID(),
        organizationId: organizationA,
        userId: userA,
        role: "member",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        organizationId: organizationA,
        userId: userB,
        role: "member",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        organizationId: organizationB,
        userId: userB,
        role: "member",
        createdAt: new Date(),
      },
    ]);

    const created = await db.transaction(async (tx) => {
      const first = await insertNotification(tx, {
        organizationId: organizationA,
        type: "feedback_created",
        projectId: null,
        feedbackId: null,
        projectReviewId: null,
        title: "New feedback",
        body: "A client left feedback.",
      });
      const second = await insertNotification(tx, {
        organizationId: organizationA,
        type: "feedback_commented",
        projectId: null,
        feedbackId: null,
        projectReviewId: null,
        title: "New client comment",
        body: "A client commented.",
      });
      const foreign = await insertNotification(tx, {
        organizationId: organizationB,
        type: "review_approved",
        projectId: null,
        feedbackId: null,
        projectReviewId: null,
        title: "Project approved",
        body: "A project was approved.",
      });

      return { first, second, foreign };
    });

    notificationA = created.first.id;
    notificationASecond = created.second.id;
    notificationB = created.foreign.id;
  });

  afterAll(async () => {
    await db.delete(schema.organization).where(inArray(schema.organization.id, [organizationA, organizationB]));
    await db.delete(schema.user).where(inArray(schema.user.id, [userA, userB]));
  });

  it("lists workspace notifications with per-user unread state", async () => {
    const list = await queries.listNotifications(organizationA, userA);

    expect(list).toHaveLength(2);
    expect(list.every((notification: NotificationDto) => !notification.read)).toBe(true);
    expect(list.every((notification: NotificationDto) => notification.href === "/dashboard")).toBe(true);
    expect(await queries.getUnreadNotificationCount(organizationA, userA)).toBe(2);
  });

  it("marks one notification read idempotently without affecting another user", async () => {
    expect(await queries.markNotificationRead(notificationA, organizationA, userA)).toBe(true);
    expect(await queries.markNotificationRead(notificationA, organizationA, userA)).toBe(true);
    expect(await queries.getUnreadNotificationCount(organizationA, userA)).toBe(1);
    expect(await queries.getUnreadNotificationCount(organizationA, userB)).toBe(2);

    const list = await queries.listNotifications(organizationA, userA);
    expect(list.find((notification) => notification.id === notificationA)?.read).toBe(true);
    expect(list.find((notification) => notification.id === notificationASecond)?.read).toBe(false);
  });

  it("marks all remaining notifications read", async () => {
    expect(await queries.markAllNotificationsRead(organizationA, userA)).toBe(1);
    expect(await queries.getUnreadNotificationCount(organizationA, userA)).toBe(0);
    expect(await queries.markAllNotificationsRead(organizationA, userA)).toBe(0);
  });

  it("does not allow a workspace to mark another workspace notification read", async () => {
    expect(await queries.markNotificationRead(notificationA, organizationB, userB)).toBe(false);
    expect(await queries.getUnreadNotificationCount(organizationB, userB)).toBe(1);
    expect(await queries.markNotificationRead(notificationB, organizationB, userB)).toBe(true);
  });
});
