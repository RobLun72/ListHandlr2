"use client";
import * as React from "react";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();

  return (
    <div>
      <div>dsd One List {params.slug}</div>
      <ul>
        <li>list 1</li>
        <li>list 2</li>
      </ul>
    </div>
  );
}
