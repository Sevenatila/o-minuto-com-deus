
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { gratitude, insight, answered } = body;

    const journal = await prisma.devotionalJournal.create({
      data: {
        userId: user.id,
        gratitude,
        insight,
        answered: answered || false,
      },
    });

    return NextResponse.json(journal);
  } catch (error) {
    console.error('Error creating devotional journal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const journals = await prisma.devotionalJournal.findMany({
      where: { userId: user.id },
      orderBy: { sessionDate: 'desc' },
      take: limit,
    });

    return NextResponse.json(journals);
  } catch (error) {
    console.error('Error fetching devotional journals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
