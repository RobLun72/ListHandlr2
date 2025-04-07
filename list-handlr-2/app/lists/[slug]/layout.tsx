import { Metadata } from "next";

export const metadata: Metadata = {
  title: "One List",
  description: "One named list in app",
};

export default function ListsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section>{children}</section>;
}
