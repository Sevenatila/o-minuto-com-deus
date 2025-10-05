import { NextResponse } from 'next/server';

// Sistema de Reflexões Diárias foi removido para simplificar o app
export async function GET() {
  return NextResponse.json(
    { error: 'Reflexões Diárias foi removido. Use "Respira & Ore" para devocionais guiados.' },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Reflexões Diárias foi removido. Use "Respira & Ore" para devocionais guiados.' },
    { status: 410 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Reflexões Diárias foi removido. Use "Respira & Ore" para devocionais guiados.' },
    { status: 410 }
  );
}
