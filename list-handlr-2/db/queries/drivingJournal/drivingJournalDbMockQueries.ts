import { NamedDateListData } from "@/DTO/oneDateListData";
import { DrivingJournalItemData } from "@/DTO/drivingJournalItemData";
import {
  handleGetDrivingJournalList,
  handleAddDrivingJournalItem,
  handleEditDrivingJournalItem,
  handleDeleteDrivingJournalItem,
  handleEditDrivingJournalListUpdated,
} from "@/MSW/RequestHelpers/drivingJournalHelper";
import {
  IDrivingJournalDbQueries,
  DrivingJournalListResponse,
} from "./drivingJournalDbInterfaces";

export class DrivingJournalMockDbQueries implements IDrivingJournalDbQueries {
  async getListDataForDrivingJournal(
    listName: string,
  ): Promise<DrivingJournalListResponse> {
    return await handleGetDrivingJournalList(listName);
  }

  async addDrivingJournalItemToDb(
    row: NamedDateListData<DrivingJournalItemData>,
    listId: number,
  ): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
    await handleAddDrivingJournalItem(row, listId);
  }

  async editDrivingJournalItemToDb(
    row: NamedDateListData<DrivingJournalItemData>,
  ): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
    await handleEditDrivingJournalItem(row);
  }

  async deleteDrivingJournalItemToDb(
    row: NamedDateListData<DrivingJournalItemData>,
  ): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
    await handleDeleteDrivingJournalItem(row);
  }

  async editListLastUpdatedToDb(listId: number): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
    await handleEditDrivingJournalListUpdated(listId);
  }
}
