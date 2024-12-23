import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

async function uploadImage(base64Image: string, folder?: string): Promise<any> {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder,
    });

    return uploadResponse;
  } catch (error) {
    console.error("Помилка завантаження зображення:", error);
    throw error;
  }
}

function extractPublicId(imageUrl: string): string {
  const urlParts = imageUrl.split("/");
  const fileName = urlParts.pop()?.split(".")[0];
  const versionIndex = urlParts.findIndex((part) => part.startsWith("v"));
  const folderPath = urlParts.slice(versionIndex + 1).join("/");
  return `${folderPath}/${fileName}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const uploadResult = await uploadImage(body.image, "menu-photos");

    return NextResponse.json(
      {
        message: "Зображення успішно завантажено",
        imageUrl: uploadResult.secure_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Помилка завантаження зображення:", error);

    return NextResponse.json(
      { error: "Не вдалося завантажити зображення" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL зображення є обов'язковим" },
        { status: 400 }
      );
    }

    const publicId = extractPublicId(imageUrl);
    console.log("Публічний ID:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok") {
      throw new Error("Не вдалося видалити зображення");
    }

    return NextResponse.json(
      { message: "Зображення успішно видалено" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Помилка видалення зображення:", error);

    return NextResponse.json(
      { error: "Не вдалося видалити зображення" },
      { status: 500 }
    );
  }
}
