"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";

const Dashboard = () => {
  const router = useRouter();

  const [changes, setChanges] = useState([]);

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
      const data = await response.json();
      setChanges(data);
    } catch (error) {
      console.error("Error listing changes:", error);
    }
  };

  // Run printChanges every second
  useEffect(() => {
    const interval = setInterval(() => {
      printChanges();
    }, 1000); // Call every 1000ms (1 second)

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []); // Empty dependency array to run only once on mount

  return (
    <div>
      <Button onClick={handleLogout}>Logout</Button>
      <ul>
        {changes &&
          changes.length > 0 &&
          changes.map((change) => <li>{JSON.stringify(change)}</li>)}
      </ul>
    </div>
  );
};

export default Dashboard;
