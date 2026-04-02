export function isSupportedImage(file) {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}

export async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Falha ao ler imagem.'));
    reader.readAsDataURL(file);
  });
}

export async function compressImage(file, options = {}) {
  const maxWidth = options.maxWidth || 1280;
  const maxHeight = options.maxHeight || 1280;
  const quality = typeof options.quality === 'number' ? options.quality : 0.82;

  const imageUrl = URL.createObjectURL(file);
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Falha ao processar imagem.'));
    img.src = imageUrl;
  });

  const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const targetWidth = Math.round(image.width * ratio);
  const targetHeight = Math.round(image.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    URL.revokeObjectURL(imageUrl);
    return file;
  }

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  URL.revokeObjectURL(imageUrl);

  const blob = await new Promise((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/jpeg', quality);
  });

  if (!blob) return file;

  return new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
}
