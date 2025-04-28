"use client";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_500px_20px] items-center justify-items-center min-h-screen p-4 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          src="/lists.png"
          alt="listhandlr logo"
          width={380}
          height={380}
          priority
        />
        Create a list of items you want to keep track of.
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        deployed on vercel hosting
      </footer>
    </div>
  );
}
