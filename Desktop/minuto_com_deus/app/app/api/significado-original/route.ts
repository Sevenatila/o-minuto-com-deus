import { NextResponse } from 'next/server';

// Sistema de Significado Original (Grego/Hebraico) foi removido
export async function GET() {
  return NextResponse.json(
    { error: 'Significado Original foi removido. Use "Fale com a Bíblia" para perguntas sobre significados.' },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Significado Original foi removido. Use "Fale com a Bíblia" para perguntas sobre significados.' },
    { status: 410 }
  );
}
