export async function GET(request: Request) {

    const res = await fetch('http://localhost:4000/auth/google');

    // Get body of response
    const body = await res.json();

    console.log(body)
   
    return Response.json({ hello: 'world' })
}