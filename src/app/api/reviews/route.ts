import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const {
      page = "1",
      limit = "10",
      rating,
      sort = "desc",
      userOnly,
      userId,
    } = query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (rating && rating !== "") {
      where.rating = parseInt(rating, 10);
    }
    if (userOnly === "true" && userId) {
      where.user_id = parseInt(userId, 10);
    }
    const reviews = await db.reviews.findMany({
      skip,
      take: limitNumber,
      where,
      include: {
        users: {
          select: { first_name: true },
        },
      },
      orderBy: [
        {
          last_updated: sort === "asc" ? "asc" : "desc",
        },
      ],
    });

    const totalReviews = await db.reviews.count({ where });

    return NextResponse.json({
      reviews,
      total: totalReviews,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(totalReviews / limitNumber),
    });
  } catch (error) {
    console.error("Помилка отримання відгуків:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати відгуки" },
      { status: 500 }
    );
  }
}

const reviewSchema = z.object({
  user_id: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = reviewSchema.parse(body);

    const newReview = await db.reviews.create({
      data,
    });

    return NextResponse.json(newReview);
  } catch (error) {
    console.error("Помилка додавання відгуку:", error);
    return NextResponse.json(
      { error: "Не вдалося додати відгук" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get("id") || "");
    if (!id) {
      return NextResponse.json({ error: "ID є обов'язковим" }, { status: 400 });
    }

    const body = await req.json();
    const { rating, comment } = body;
    const updatedReview = await db.reviews.update({
      where: { id },
      data: { rating, comment, edited_at: new Date() },
    });
    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Помилка оновлення відгуку:", error);
    return NextResponse.json(
      { error: "Не вдалося оновити відгук" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get("id") || "");
    await db.reviews.delete({ where: { id } });
    return NextResponse.json({ message: "Відгук успішно видалено" });
  } catch (error) {
    console.error("Помилка видалення відгуку:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити відгук" },
      { status: 500 }
    );
  }
}
