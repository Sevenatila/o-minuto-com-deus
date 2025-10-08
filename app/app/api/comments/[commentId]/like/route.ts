
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Recurso não disponível' },
    { status: 404 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Recurso não disponível' },
    { status: 404 }
  );
}
