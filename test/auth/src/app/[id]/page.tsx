"use client";

import { useEffect, useState } from "react";

export default function Page({ params }: { params: { id: string } }) {

    const [user, setUser] = useState({});

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });


                // Handle successful response
                const res = await response.json();
                
                setUser(res);

            } catch (error) {
                console.error('An error occurred:', error);
            }
        };

        console.log(params.id)


        if (params.id) {
            fetchUser();
        }

    }, [params.id]);

    return (
        <>
            <p>ID: {user?.id ?? 'Loading...'}</p>
            <p>USERNAME: {user?.username ?? 'Loading...'}</p>

            
        </>

    )
}