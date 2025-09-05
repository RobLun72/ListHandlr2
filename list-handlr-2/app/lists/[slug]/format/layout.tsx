import { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Collab",
  description: "Collab setup",
  icons: {
    icon: "/listHandlr.png",
  },
};

export default function CollabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section>{children}</section>;
}
