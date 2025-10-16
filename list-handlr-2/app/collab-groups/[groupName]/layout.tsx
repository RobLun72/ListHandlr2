import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Group Members",
  description: "Edit collaboration group membership",
};

export default function GroupDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="md:min-w-2xl">{children}</section>;
}
