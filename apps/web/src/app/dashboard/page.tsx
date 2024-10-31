"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import fetchServer from "../../utils/serverFetch";

const CookiesComponent = () => {
  const [cookies, setCookies] = useState(null);

  const handleFetchCookies = async () => {
    try {
      const response = await fetch("/api/get-cookies", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent with the request
      });
      const data = await response.json();
      setCookies(data.cookies); // Set cookies in state
    } catch (error) {
      console.error("Error fetching cookies:", error);
    }
  };

  useEffect(() => {
    handleFetchCookies();
  }, []);

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetchServer("http://localhost:4000/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Redirect or reload after logout
        setCookies(null);
        router.push("/");
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      {cookies && (
        <div>
          <h3>Cookies:</h3>
          <pre>{JSON.stringify(cookies, null, 2)}</pre>
        </div>
      )}
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default CookiesComponent;
