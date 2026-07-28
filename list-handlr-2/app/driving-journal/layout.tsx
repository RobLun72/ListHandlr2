import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Driving Journal",
  description: "Driving journal entries",
};

export default function DrivingJournalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="md:min-w-3xl">{children}</section>;
}
