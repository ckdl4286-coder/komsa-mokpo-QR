'use server';

import { prisma } from '../lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const id = formData.get('id');
  const pw = formData.get('password');
  if (id === 'mokpo9594' && pw === 'mokpo9594!') {
    const cookieStore = await cookies();
    cookieStore.set('admin-auth', 'true', { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1일 유지
    });
  }
  revalidatePath('/admin');
  redirect('/admin');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-auth');
  revalidatePath('/admin');
}

export async function addShip(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  if (!name || !slug) return;
  await prisma.ship.create({
    data: { name, urlSlug: slug }
  });
  revalidatePath('/admin');
}

export async function updateCoreLink(shipId: string, type: string, url: string) {
  await prisma.ship.update({
    where: { id: shipId },
    data: { [type]: url }
  });
  revalidatePath('/admin');
}

export async function updateWeather(formData: FormData) {
  const txt = formData.get('weather') as string;
  await prisma.systemConfig.upsert({
    where: { id: 'global' },
    create: { id: 'global', tomorrowWeather: txt, totalVisitors: 0 },
    update: { tomorrowWeather: txt }
  });
  revalidatePath('/admin');
}

export async function addCustomLink(shipId: string, title: string, url: string) {
  await prisma.shipLink.create({
    data: { shipId, title, url, icon: 'ExternalLink' }
  });
  revalidatePath('/admin');
}

export async function deleteCustomLink(id: string) {
  await prisma.shipLink.delete({ where: { id } });
  revalidatePath('/admin');
}

export async function deleteShip(id: string) {
  await prisma.ship.delete({ where: { id } });
  revalidatePath('/admin');
}

export async function updateShipInfo(shipId: string, data: any) {
  await prisma.ship.update({
    where: { id: shipId },
    data
  });
  revalidatePath('/admin');
}

export async function updateCustomLink(id: string, title: string, url: string) {
  await prisma.shipLink.update({
    where: { id },
    data: { title, url }
  });
  revalidatePath('/admin');
  revalidatePath('/');
}
