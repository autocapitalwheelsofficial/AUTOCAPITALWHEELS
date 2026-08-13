import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Password login is disabled. Please use Google Login.' },
    { status: 403 }
  );
}
