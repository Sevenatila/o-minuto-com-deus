
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
    const { ansiedadeNivel, financasPreocupacao, outrosTopicos, onboardingCompleted } = body;

    // Upsert user preferences
    const userPreference = await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {
        ansiedadeNivel,
        financasPreocupacao,
        outrosTopicos,
        onboardingCompleted,
        preferenciaOnboarding: {
          ansiedadeNivel,
          financasPreocupacao,
          outrosTopicos,
        },
      },
      create: {
        userId: user.id,
        ansiedadeNivel,
        financasPreocupacao,
        outrosTopicos,
        onboardingCompleted,
        preferenciaOnboarding: {
          ansiedadeNivel,
          financasPreocupacao,
          outrosTopicos,
        },
      },
    });

    return NextResponse.json(userPreference);
  } catch (error) {
    console.error('Error saving user preferences:', error);
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
      include: { userPreference: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.userPreference);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
