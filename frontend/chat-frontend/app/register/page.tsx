"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) return alert("Registration failed");
    alert("Registered successfully");
    router.push("/login");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white w-96 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

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
          onClick={register}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
        >
          Register
        </button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}