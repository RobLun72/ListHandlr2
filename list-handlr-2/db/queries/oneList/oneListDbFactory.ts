import { IOneListDbQueries } from "./oneListDbInterfaces";
import { OneListMockDbQueries } from "./oneListDbMockQueries";
import { OneListRealDbQueries } from "./oneListDbRealQueries";

export class OneListDbFactory {
  static createDbQueries(): IOneListDbQueries {
    if (process.env.NODE_ENV === "test") {
      return new OneListMockDbQueries();
    }

    if (
      process.env.NEXT_PUBLIC_ENABLE_MSW_MOCKING === "true" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("Using OneListMockDbQueries for development");
      return new OneListMockDbQueries();
    }

    console.log("Using OneListRealDbQueries");
    return new OneListRealDbQueries();
  }
}
