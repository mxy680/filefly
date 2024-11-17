"use client";

import { useState } from "react";
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

  const printChanges = async () => {
    try {
      const response = await fetch("/api/google/changes", { method: "GET" });
      const changes = await response.json();
      console.log(changes);
    } catch (error) {
      console.error("Error listing changes:", error);
    }
  }

  return (
    <div>
      <Button onClick={handleLogout}>Logout</Button>
      <Button onClick={printChanges}>Print Changes</Button>
    </div>
  );
};

export default Dashboard;
