"use client";

import api from "../../utils/axios";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";

const CookiesComponent = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      router.push("/"); // Redirect to login after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleProtectedRoute = async () => {
    try {
      const res = await api.get("/auth/protected");
      console.log(res.data);
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

export default CookiesComponent;
