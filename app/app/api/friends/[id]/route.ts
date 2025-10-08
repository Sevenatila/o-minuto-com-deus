import { NextResponse } from 'next/server';

// Sistema de Amizades foi removido - usuários interagem através de Planos com Amigos
export async function GET() {
  return NextResponse.json(
    { error: 'Sistema de amizades foi removido. Use "Planos com Amigos" para conectar com outros usuários.' },
    { status: 410 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Sistema de amizades foi removido. Use "Planos com Amigos" para conectar com outros usuários.' },
    { status: 410 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Sistema de amizades foi removido. Use "Planos com Amigos" para conectar com outros usuários.' },
    { status: 410 }
  );
}
