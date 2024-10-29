export const dynamic = 'force-static';

export async function GET(request: Request) {
    // Send POST to /api/auth/login
    const res = await fetch('http://localhost:4000/auth/login?provider=google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    const data = await res.json();
    return Response.json(data);
}