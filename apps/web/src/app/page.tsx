"use client";

import { Button } from "@repo/ui/components/ui/button";

export default function Home() {
  const handleLogin = async () => {
    const response = await fetch("/api/auth/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button onClick={handleLogin}>Sign up</Button>
    </div>
  );
}
