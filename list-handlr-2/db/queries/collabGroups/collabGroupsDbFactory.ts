import { ICollabGroupsDbQueries } from "./collabGroupsDbInterfaces";
import { CollabGroupsMockDbQueries } from "./collabGroupsDbMockQueries";
import { CollabGroupsRealDbQueries } from "./collabGroupsDbRealQueries";

export class CollabGroupsDbFactory {
  private static mockInstance: CollabGroupsMockDbQueries | null = null;

  static createDbQueries(): ICollabGroupsDbQueries {
    if (process.env.NODE_ENV === "test") {
      // Return singleton instance in test mode so seeded data persists
      if (!this.mockInstance) {
        this.mockInstance = new CollabGroupsMockDbQueries();
      }
      return this.mockInstance;
    }

    if (
      process.env.NEXT_PUBLIC_ENABLE_MSW_MOCKING === "true" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("Using CollabGroups MockDbQueries for development");
      return new CollabGroupsMockDbQueries();
    }

    console.log("Using CollabGroups RealDbQueries");
    return new CollabGroupsRealDbQueries();
  }

  /**
   * Resets the mock instance. Useful for cleaning up between tests.
   */
  static resetMockInstance(): void {
    this.mockInstance = null;
  }
}
