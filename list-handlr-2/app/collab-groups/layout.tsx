import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collaboration Groups",
  description: "Manage collaboration groups",
};

export default function CollabGroupsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="md:min-w-3xl">{children}</section>;
}
