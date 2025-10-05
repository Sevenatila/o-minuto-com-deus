
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    let preferences = await prisma.devotionalPreference.findUnique({
      where: { userId: user.id },
    });

    // Se não existir, criar com defaults
    if (!preferences) {
      preferences = await prisma.devotionalPreference.create({
        data: {
          userId: user.id,
          ritualMinutes: 10,
          reminderTime: '08:00',
          reminderEnabled: true,
          voiceGuidance: true,
          hapticsEnabled: true,
          ambienceVolume: 0.3,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching devotional preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const {
      ritualMinutes,
      reminderTime,
      reminderEnabled,
      voiceGuidance,
      hapticsEnabled,
      ambienceVolume,
    } = body;

    // Validações
    if (ritualMinutes && ![5, 10, 15].includes(ritualMinutes)) {
      return NextResponse.json(
        { error: 'ritualMinutes must be 5, 10, or 15' },
        { status: 400 }
      );
    }

    if (ambienceVolume !== undefined && (ambienceVolume < 0 || ambienceVolume > 1)) {
      return NextResponse.json(
        { error: 'ambienceVolume must be between 0 and 1' },
        { status: 400 }
      );
    }

    const preferences = await prisma.devotionalPreference.upsert({
      where: { userId: user.id },
      update: {
        ...(ritualMinutes !== undefined && { ritualMinutes }),
        ...(reminderTime !== undefined && { reminderTime }),
        ...(reminderEnabled !== undefined && { reminderEnabled }),
        ...(voiceGuidance !== undefined && { voiceGuidance }),
        ...(hapticsEnabled !== undefined && { hapticsEnabled }),
        ...(ambienceVolume !== undefined && { ambienceVolume }),
      },
      create: {
        userId: user.id,
        ritualMinutes: ritualMinutes || 10,
        reminderTime: reminderTime || '08:00',
        reminderEnabled: reminderEnabled !== undefined ? reminderEnabled : true,
        voiceGuidance: voiceGuidance !== undefined ? voiceGuidance : true,
        hapticsEnabled: hapticsEnabled !== undefined ? hapticsEnabled : true,
        ambienceVolume: ambienceVolume !== undefined ? ambienceVolume : 0.3,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating devotional preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
