
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book');
    const chapter = searchParams.get('chapter');

    if (!book || !chapter) {
      return NextResponse.json(
        { error: 'Livro e capítulo são obrigatórios' },
        { status: 400 }
      );
    }

    const highlights = await prisma.highlight.findMany({
      where: {
        userId: session.user.id,
        book,
        chapter: parseInt(chapter),
      },
      orderBy: { verseNumber: 'asc' },
    });

    return NextResponse.json(highlights ?? []);
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar destaques' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { book, chapter, verseNumber, highlightedText, color } = body ?? {};

    if (!book || !chapter || !verseNumber || !highlightedText || !color) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const highlight = await prisma.highlight.create({
      data: {
        userId: session.user.id,
        book,
        chapter: parseInt(chapter),
        verseNumber: parseInt(verseNumber),
        highlightedText,
        color,
      },
    });

    return NextResponse.json(highlight);
  } catch (error) {
    console.error('Error creating highlight:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar destaque' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    await prisma.highlight.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json(
      { error: 'Erro ao remover destaque' },
      { status: 500 }
    );
  }
}
