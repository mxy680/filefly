import { NextRequest, NextResponse } from 'next/server';
import { serverRequest } from '@/src/utils/serverRequest';

export async function GET(req: NextRequest) {
    try {
        const response = await serverRequest('get', '/google/changes', req);
        return NextResponse.json(response.data, { status: 200 });
    } 
    catch (error: any) {
        console.error('Error fetching files:', error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
