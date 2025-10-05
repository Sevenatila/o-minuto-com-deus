
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

    const preferences = await prisma.devotionalPreference.findUnique({
      where: { userId: user.id },
    });

    const totalSessions = await prisma.devotionalSession.count({
      where: { userId: user.id },
    });

    const totalMinutes = await prisma.devotionalSession.aggregate({
      where: { userId: user.id },
      _sum: {
        durationSec: true,
      },
    });

    // Calcular dias de paz (sessões onde completou respira + palavra)
    const sessions = await prisma.devotionalSession.findMany({
      where: { userId: user.id },
    });

    const peaceDays = sessions.filter((s) => {
      const steps = s.completedSteps as string[];
      return steps.includes('respira') && steps.includes('palavra');
    }).length;

    return NextResponse.json({
      streakDays: preferences?.streakDays || 0,
      peaceDays,
      totalSessions,
      totalMinutes: Math.floor((totalMinutes._sum.durationSec || 0) / 60),
      lastCompletedDay: preferences?.lastCompletedDay || 0,
    });
  } catch (error) {
    console.error('Error fetching devotional stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
