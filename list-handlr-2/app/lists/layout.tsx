import { Metadata } from "next";
import { ThemedLayout } from "./ThemedLayout";

export const metadata: Metadata = {
  title: "All Lists",
  description: "All lists in app",
};

export default function ListsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="md:min-w-3xl">
      <ThemedLayout>{children}</ThemedLayout>
    </section>
  );
}
