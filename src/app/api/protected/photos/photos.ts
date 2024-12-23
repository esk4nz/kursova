export async function deletePhoto(imageUrl: string): Promise<void> {
  const response = await fetch("/api/protected/photos", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Не вдалося видалити фото");
  }
}

export async function uploadPhoto(photo: File): Promise<string> {
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const base64String = await convertToBase64(photo);

  const response = await fetch("/api/protected/photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64String }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Не вдалося завантажити фото");
  }

  const result = await response.json();
  return result.imageUrl;
}
