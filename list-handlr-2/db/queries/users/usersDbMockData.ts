export interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  last_name: string;
  first_name: string;
  is_suspended: boolean;
  picture: string | null;
  created_on: string;
  last_signed_in: string | null;
  total_sign_ins: number;
  failed_sign_ins: number;
}

export const allUsers: UserRecord[] = [
  {
    id: "user-1",
    email: "alice@example.com",
    picture: "",
    full_name: "Alice Johnson",
    last_name: "Johnson",
    created_on: "2024-01-01T08:19:25.322444+00:00",
    first_name: "Alice",
    is_suspended: false,
    last_signed_in: "2024-01-01T08:27:50.257586+00:00",
    total_sign_ins: 0,
    failed_sign_ins: 0,
  },
  {
    id: "user-2",
    email: "bob@example.com",
    picture: "",
    full_name: "Bob Smith",
    last_name: "Smith",
    created_on: "2024-01-01T08:19:25.322444+00:00",
    first_name: "Bob",
    is_suspended: false,
    last_signed_in: "2024-01-01T08:27:50.257586+00:00",
    total_sign_ins: 0,
    failed_sign_ins: 0,
  },
  {
    id: "user-3",
    email: "charlie@example.com",
    picture: "",
    full_name: "Charlie Davis",
    last_name: "Davis",
    created_on: "2024-01-01T08:19:25.322444+00:00",
    first_name: "Charlie",
    is_suspended: false,
    last_signed_in: "2024-01-01T08:27:50.257586+00:00",
    total_sign_ins: 0,
    failed_sign_ins: 0,
  },
  {
    id: "user-4",
    email: "diana@example.com",
    picture: "",
    full_name: "Diana Wilson",
    last_name: "Wilson",
    created_on: "2024-01-01T08:19:25.322444+00:00",
    first_name: "Diana",
    is_suspended: false,
    last_signed_in: "2024-01-01T08:27:50.257586+00:00",
    total_sign_ins: 0,
    failed_sign_ins: 0,
  },
  {
    id: "user-5",
    email: "eve@example.com",
    picture: "",
    full_name: "Eve Brown",
    last_name: "Brown",
    created_on: "2024-01-01T08:19:25.322444+00:00",
    first_name: "Eve",
    is_suspended: false,
    last_signed_in: "2024-01-01T08:27:50.257586+00:00",
    total_sign_ins: 0,
    failed_sign_ins: 0,
  },
  {
    id: "user-6",
    email: "brent@gmail.com",
    picture: "",
    full_name: "Brent Lane",
    last_name: "Lane",
    created_on: "2024-01-01T08:19:25.322444+00:00",
    first_name: "Brent",
    is_suspended: false,
    last_signed_in: "2024-01-01T08:27:50.257586+00:00",
    total_sign_ins: 0,
    failed_sign_ins: 0,
  },
];
