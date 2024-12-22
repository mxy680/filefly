"use client";

const LoginPage = () => {
  const handleLogin = async (provider: string) => {
    window.location.href = `/api/auth/login/${provider}`;
  };

  return (
    <div>
      <button className='m-4 border-2' onClick={() => handleLogin("google")}>Login with Google</button>
      <button className='m-4 border-2' onClick={() => handleLogin("dropbox")}>Login with Dropbox</button>
    </div>
  );
};

export default LoginPage;
