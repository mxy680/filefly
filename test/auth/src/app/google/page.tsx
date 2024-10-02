'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const GoogleDriveConnectionPage = () => {
  const router = useRouter();

  // Redirect to the backend Google OAuth route to start the login process
  useEffect(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-drive`;
  }, []);

  return <p>Connecting to Google Drive...</p>;
};

export default GoogleDriveConnectionPage;
