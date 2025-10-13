import { describe, test, expect } from "vitest";
import { CollabGroupsDbFactory } from "./collabGroupsDbFactory";
import { CollabGroupsMockDbQueries } from "./collabGroupsDbMockQueries";

describe("CollabGroupsDbFactory", () => {
  test("should return CollabGroupsMockDbQueries when NODE_ENV is test", () => {
    // In test environment, factory should return mock queries
    const queries = CollabGroupsDbFactory.createDbQueries();

    expect(queries).toBeInstanceOf(CollabGroupsMockDbQueries);
  });

  test("mock queries should have seedTestData method", () => {
    const queries =
      CollabGroupsDbFactory.createDbQueries() as CollabGroupsMockDbQueries;

    expect(queries).toHaveProperty("seedTestData");
    expect(typeof queries.seedTestData).toBe("function");
  });

  test("seedTestData should populate mock data", async () => {
    const queries =
      CollabGroupsDbFactory.createDbQueries() as CollabGroupsMockDbQueries;
    const testUserId = "test-user-123";

    // Seed the data
    queries.seedTestData(testUserId);

    // Verify groups were created
    const groups = await queries.getAllGroupsForUser(testUserId);

    expect(groups).toHaveLength(3);
    expect(groups.map((g) => g.name)).toEqual(
      expect.arrayContaining(["DevTeam", "Marketing", "TestGroup"])
    );
  });

  test("seedTestData should create groups with correct member counts", async () => {
    const queries =
      CollabGroupsDbFactory.createDbQueries() as CollabGroupsMockDbQueries;
    const testUserId = "test-user-123";

    queries.seedTestData(testUserId);

    const groups = await queries.getAllGroupsForUser(testUserId);
    const devTeam = groups.find((g) => g.name === "DevTeam");
    const marketing = groups.find((g) => g.name === "Marketing");
    const testGroup = groups.find((g) => g.name === "TestGroup");

    expect(devTeam?.memberCount).toBe(3);
    expect(marketing?.memberCount).toBe(2);
    expect(testGroup?.memberCount).toBe(1);
  });

  test("seedTestData should create groups with correct descriptions", async () => {
    const queries =
      CollabGroupsDbFactory.createDbQueries() as CollabGroupsMockDbQueries;
    const testUserId = "test-user-123";

    queries.seedTestData(testUserId);

    const groups = await queries.getAllGroupsForUser(testUserId);
    const devTeam = groups.find((g) => g.name === "DevTeam");
    const marketing = groups.find((g) => g.name === "Marketing");
    const testGroup = groups.find((g) => g.name === "TestGroup");

    expect(devTeam?.description).toBe("Development team collaboration");
    expect(marketing?.description).toBe("Marketing department group");
    expect(testGroup?.description).toBeNull();
  });

  test("seedTestData should create groups with members", async () => {
    const queries =
      CollabGroupsDbFactory.createDbQueries() as CollabGroupsMockDbQueries;
    const testUserId = "test-user-123";

    queries.seedTestData(testUserId);

    // Get DevTeam with members
    const devTeam = await queries.getGroupByName(testUserId, "DevTeam");

    expect(devTeam).not.toBeNull();
    expect(devTeam?.members).toHaveLength(3);
    expect(devTeam?.members.map((m) => m.member_user_id)).toEqual(
      expect.arrayContaining(["user-1", "user-2", "user-3"])
    );
  });
});
