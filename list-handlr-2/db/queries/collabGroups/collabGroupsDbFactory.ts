import { ICollabGroupsDbQueries } from "./collabGroupsDbInterfaces";
import { CollabGroupsMockDbQueries } from "./collabGroupsDbMockQueries";
import { CollabGroupsRealDbQueries } from "./collabGroupsDbRealQueries";

export class CollabGroupsDbFactory {
  static createDbQueries(): ICollabGroupsDbQueries {
    if (process.env.NODE_ENV === "test") {
      return new CollabGroupsMockDbQueries();
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
}
