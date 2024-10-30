"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:4000/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies in the request
      });

      if (response.ok) {
        // Redirect or reload after logout
        router.push("/");
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      <button onClick={handleFetchCookies}>Fetch Cookies</button>
      {cookies && (
        <div>
          <h3>Cookies:</h3>
          <pre>{JSON.stringify(cookies, null, 2)}</pre>
        </div>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default CookiesComponent;
