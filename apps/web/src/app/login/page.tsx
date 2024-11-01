"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/axios"; // Ensure this is configured with baseURL and credentials
import { Button } from "@repo/ui/components/ui/button";

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/check"); // Call NestJS endpoint
        if (response.data.authenticated) {
          // Redirect if authenticated
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("User is not authenticated:", error);
        // No action needed; stay on the login page
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async () => {
    window.location.href = "http://localhost:4000/auth/google/login";
  };

  return (
    <div>
      <h1>Login</h1>
      <Button onClick={handleLogin}>Sign up with google</Button>
    </div>
  );
};

export default LoginPage;
