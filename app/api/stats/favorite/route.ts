import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const { shipId, action } = await request.json();

    if (!shipId) {
      return NextResponse.json({ error: 'shipId is required' }, { status: 400 });
    }

    const updateData = action === 'add' 
      ? { favoriteCount: { increment: 1 } } 
      : { favoriteCount: { decrement: 1 } };

    const updatedShip = await prisma.ship.update({
      where: { id: shipId },
      data: updateData
    });

    return NextResponse.json({ success: true, favoriteCount: updatedShip.favoriteCount });
  } catch (error) {
    console.error('[즐겨찾기 API] 오류:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
