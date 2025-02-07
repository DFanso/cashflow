import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { description, amount, date } = await request.json();

    if (!description || !amount || !date) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    db.prepare('INSERT INTO outgoings (description, amount, date) VALUES (?, ?, ?)').run(description, amount, date);

    return NextResponse.json({ message: 'Outgoing added successfully!' });
  } catch (error) {
    console.error('Failed to add outgoing:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
