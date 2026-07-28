import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Driving Journal Entry",
  description: "Manage driving journal entries",
};

export default function DrivingJournalDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
