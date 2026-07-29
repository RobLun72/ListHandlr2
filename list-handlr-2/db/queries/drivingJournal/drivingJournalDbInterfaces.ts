import { NamedDateListData } from "@/DTO/oneDateListData";
import { DrivingJournalItemData } from "@/DTO/drivingJournalItemData";

export interface IDrivingJournalDbQueries {
  // driving journal list related
  getListDataForDrivingJournal(
    listName: string,
  ): Promise<DrivingJournalListResponse>;
  addDrivingJournalItemToDb(
    row: NamedDateListData<DrivingJournalItemData>,
    listId: number,
  ): Promise<void>;
  editDrivingJournalItemToDb(
    row: NamedDateListData<DrivingJournalItemData>,
  ): Promise<void>;
  deleteDrivingJournalItemToDb(
    row: NamedDateListData<DrivingJournalItemData>,
  ): Promise<void>;
  editListLastUpdatedToDb(listId: number): Promise<void>;
}

export interface DrivingJournalListRecord {
  id: number;
  index: number;
  list_name: string;
  list_type: string;
  last_update: Date;
  last_item_update: Date;
  user_id: string | null;
}

export interface DrivingJournalItemRecord {
  id: number;
  list_id: number;
  index: number;
  start_odometer: string;
  end_odometer: string;
  distance: number;
  notes: string | null;
  item_date: Date;
}

export interface DrivingJournalListResponse {
  drivingJournalList: DrivingJournalListRecord;
  listItems: DrivingJournalItemRecord[];
}
