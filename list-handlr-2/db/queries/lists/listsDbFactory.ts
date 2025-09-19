import { IlistsDbQueries } from "./listsDbInterfaces";
import { ListsMockDbQueries } from "./listsDbMockQueries";
import { ListsRealDbQueries } from "./listsDbRealQueries";

export class ListsDbFactory {
  static createDbQueries(): IlistsDbQueries {
    if (process.env.NODE_ENV === "test") {
      return new ListsMockDbQueries();
    }

    if (
      process.env.NEXT_PUBLIC_ENABLE_MSW_MOCKING === "true" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("Using MockDbQueries for development");
      return new ListsMockDbQueries();
    }

    console.log("Using RealDbQueries");
    return new ListsRealDbQueries();
  }
}
