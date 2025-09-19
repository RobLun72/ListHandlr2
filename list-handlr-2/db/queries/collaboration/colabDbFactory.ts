import { IColabDbQueries } from "./colabDbInterfaces";
import { ColabRealDbQueries } from "./colabDbRealQueries";
import { ColabMockDbQueries } from "./colabDbMockQueries";

export class ColabDbFactory {
  static createDbQueries(): IColabDbQueries {
    if (process.env.NODE_ENV === "test") {
      return new ColabMockDbQueries();
    }

    if (
      process.env.NEXT_PUBLIC_ENABLE_MSW_MOCKING === "true" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("Using ColabMockDbQueries for development");
      return new ColabMockDbQueries();
    }

    console.log("Using ColabRealDbQueries");
    return new ColabRealDbQueries();
  }
}
