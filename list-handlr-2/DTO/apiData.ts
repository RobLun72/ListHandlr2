export interface ApiData<T> {
  timeStamp: string;
  rows: T[];
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
