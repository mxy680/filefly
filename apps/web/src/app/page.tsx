"use client";

import { Button } from "@repo/ui/components/ui/button";

export default function Home() {
  const handleLogin = async () => {
    window.location.href = "http://localhost:4000/auth/google/login";
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Button onClick={handleLogin}>Sign up with google</Button>
    </div>
  );
}
