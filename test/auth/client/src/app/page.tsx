"use client";

export default function Home() {

  const handleGoogleAuth = async () => {
    const response = await fetch("http://localhost:4000/auth/google", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in the request
      mode: "cors", // Ensure CORS mode is set
    });

    const data = await response.json();
    console.log(data);
  }

  return (
    <div>
      <h1>Filefly Authentication</h1>
      <button onClick={handleGoogleAuth}>Sign in with Google</button>
    </div>
  );
}
