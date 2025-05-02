"use client";
import Image from "next/image";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_500px_20px] items-center justify-items-center min-h-screen p-4 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="w-full flex justify-center items-center">
          <h1 className="text-4xl font-bold text-center">List Handlr</h1>
        </div>
        <Image
          src="/lists.png"
          alt="listhandlr logo"
          width={380}
          height={380}
          priority
        />
        <div className="w-full flex justify-center items-center">
          Create a list of items you want to keep track of.
        </div>
        {process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true" && (
          <div className="w-full px-8 flex justify-between items-center gap-[24px]">
            <LoginLink>
              <Button>Login</Button>
            </LoginLink>
            <RegisterLink>
              <Button>Sign up</Button>
            </RegisterLink>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        deployed on vercel hosting
      </footer>
    </div>
  );
}
