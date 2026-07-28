import { IDrivingJournalDbQueries } from "./drivingJournalDbInterfaces";
import { DrivingJournalRealDbQueries } from "./drivingJournalDbRealQueries";
import { DrivingJournalMockDbQueries } from "./drivingJournalDbMockQueries";

export class DrivingJournalDbFactory {
  static createDbQueries(): IDrivingJournalDbQueries {
    if (process.env.NODE_ENV === "test") {
      return new DrivingJournalMockDbQueries();
    }

    if (
      process.env.NEXT_PUBLIC_ENABLE_MSW_MOCKING === "true" &&
      process.env.NODE_ENV === "development"
    ) {
      return new DrivingJournalMockDbQueries();
    }

    return new DrivingJournalRealDbQueries();
  }
}
