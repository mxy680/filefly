"use client";

import api from "../../utils/axios";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";

const Dashboard = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleProtectedRoute = async () => {
    try {
      const res = await api.get("/auth/check");
    } catch (error) {
      console.error("Error accessing protected route:", error);
    }
  };

  return (
    <div>
      <Button onClick={handleLogout}>Logout</Button>
      <Button onClick={handleProtectedRoute}>Protected Route</Button>
    </div>
  );
};

export default Dashboard;
