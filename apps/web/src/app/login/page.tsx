"use client";

import { Button } from "@repo/ui/components/ui/button";

const LoginPage = () => {
  const handleLogin = async () => {
    window.location.href = "/api/auth/login/google"; // Redirects to Next.js API route
  };

  return (
    <div>
      <Button onClick={handleLogin}>Sign up with Google</Button>
    </div>
  );
};

export default LoginPage;
