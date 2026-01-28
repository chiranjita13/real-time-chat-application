"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    localStorage.setItem("token", data.token);
    router.push("/chat");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white w-96 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <input
          className="w-full border rounded-lg px-4 py-2 mb-4"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full border rounded-lg px-4 py-2 mb-6"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
        >
          Login
        </button>

        <p className="text-center text-sm mt-4">
          New here?{" "}
          <a href="/register" className="text-blue-500 font-medium">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}