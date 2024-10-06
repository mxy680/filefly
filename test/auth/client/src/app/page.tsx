"use client";
import axios from 'axios';

export default function Home() {
  const handleGoogleAuth = async () => {
    try {
      const response = await axios.get("/auth/google", {
        withCredentials: true, // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Perform the redirect to Google's OAuth page using the URL provided by the backend
      window.location.href = response.data.redirectUrl;
    } catch (error) {
      console.error("Error during Google authentication", error);
    }
  }

  return (
    <div>
      <h1>Filefly Authentication</h1>
      <button onClick={handleGoogleAuth}>Sign in with Google</button>
    </div>
  );
}
