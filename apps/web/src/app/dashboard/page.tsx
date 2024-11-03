"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";

const Dashboard = () => {
  const router = useRouter();
  const [files, setFiles] = useState([]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const listFiles = async () => {
    try {
      const response = await fetch("/api/google/files", { method: "GET" });
      const files = await response.json();
      setFiles(files);
    } catch (error) {
      console.error("Error listing files:", error);
    }
  };

  return (
    <div>
      <Button onClick={handleLogout}>Logout</Button>
      <Button onClick={listFiles}>List Files</Button>
      <ul>
        {files.map((file: any) => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
