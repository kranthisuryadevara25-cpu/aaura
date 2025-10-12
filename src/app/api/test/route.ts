import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/server';

export async function GET() {
  const { db } = getFirebaseAdmin();

  const snapshot = await db.collection('users').limit(5).get();
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return NextResponse.json({ users });
}
