import { DbQueriesInterface } from "./DbInterfaces";
import { RealDbQueries } from "./DbRealQueries";
import { MockDbQueries } from "./DbMockQueries";

export class DbFactory {
  static createDbQueries(): DbQueriesInterface {
    if (process.env.NODE_ENV === "test") {
      return new MockDbQueries();
    }

    if (
      process.env.NEXT_PUBLIC_ENABLE_MSW_MOCKING === "true" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("Using MockDbQueries for development");
      return new MockDbQueries();
    }

    console.log("Using RealDbQueries");
    return new RealDbQueries();
  }
}
