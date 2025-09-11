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
    <section>
      <div className="flex flex-col justify-center items-center">
        <div className="pl-1 pr-1 md:min-w-3xl min-w-sm md:max-w-3xl">
          <ThemedLayout>{children}</ThemedLayout>
        </div>
      </div>
    </section>
  );
}
