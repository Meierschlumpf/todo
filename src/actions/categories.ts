"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function getCategories() {
  const session = await requireAuth();

  const userCategories = await db.query.categories.findMany({
    where: eq(categories.userId, session.user.id),
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });

  return userCategories;
}

export async function createCategory(data: {
  name: string;
  color: string;
}) {
  const session = await requireAuth();

  const now = new Date();
  const id = `cat_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  await db.insert(categories).values({
    id,
    userId: session.user.id,
    name: data.name,
    color: data.color,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/");
  return { id };
}

export async function updateCategory(
  categoryId: string,
  data: {
    name: string;
    color: string;
  }
) {
  const session = await requireAuth();

  await db
    .update(categories)
    .set({
      name: data.name,
      color: data.color,
      updatedAt: new Date(),
    })
    .where(
      and(eq(categories.id, categoryId), eq(categories.userId, session.user.id))
    );

  revalidatePath("/");
}

export async function deleteCategory(categoryId: string) {
  const session = await requireAuth();

  // Delete the category (todos will have categoryId set to null via ON DELETE SET NULL)
  await db
    .delete(categories)
    .where(
      and(eq(categories.id, categoryId), eq(categories.userId, session.user.id))
    );

  revalidatePath("/");
}
