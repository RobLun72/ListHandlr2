import { Metadata } from "next";
import Image from "next/image";

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
        <div className="pl-1 pr-1 md:min-w-3xl min-w-sm">
          <div
            className="flex"
            style={{
              position: "relative",
              height: 80 + "px",
              width: "100%",
              paddingLeft: "1px",
            }}
          >
            <Image
              src="/todoBlue.png"
              alt="todo"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "80" }}
            />
          </div>
          <div
            className="border-appBlue border-4 border-solid"
            style={{
              marginTop: "-27px",
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
