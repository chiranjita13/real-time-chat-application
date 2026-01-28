"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    router.replace(token ? "/chat" : "/login");
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-gray-500 text-lg">Redirecting…</p>
    </div>
  );
}