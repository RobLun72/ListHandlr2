import { Metadata } from "next";

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
          <div
            className="border-appBlue border-4 border-solid"
            style={{
              marginTop: "10px",
              marginLeft: "1px",
              width: "100%",
              minHeight: "80vh",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
