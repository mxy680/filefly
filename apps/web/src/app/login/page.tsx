"use client";

import { Button } from "@repo/ui/components/ui/button";

const LoginPage = () => {
  const handleLogin = async (provider: string) => {
    window.location.href = `/api/auth/login/${provider}`;
  };

  return (
    <div>
      <Button onClick={() => handleLogin("google")}>Login with Google</Button>
      <Button onClick={() => handleLogin("github")}>Login with GitHub</Button>
    </div>
  );
};

export default LoginPage;
