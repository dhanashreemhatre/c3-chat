import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testData = {
      status: 'success',
      message: 'Server is working correctly',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      auth: {
        nextauth_url: process.env.NEXTAUTH_URL,
        nextauth_secret_exists: !!process.env.NEXTAUTH_SECRET,
        google_client_id_exists: !!process.env.GOOGLE_CLIENT_ID,
        google_client_secret_exists: !!process.env.GOOGLE_CLIENT_SECRET,
      },
      database: {
        url_exists: !!process.env.DATABASE_URL,
        provider: process.env.DATABASE_URL?.includes('postgresql') ? 'postgresql' :
                 process.env.DATABASE_URL?.includes('file:') ? 'sqlite' : 'unknown'
      }
    };

    return NextResponse.json(testData, { status: 200 });
  } catch (error) {
    console.error('Test route error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Server error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    status: 'success',
    message: 'POST method working',
    timestamp: new Date().toISOString()
  });
}
