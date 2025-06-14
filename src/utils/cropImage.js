export default function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Canvas boyutlarını kırpılacak alana göre ayarla
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // Döndürme işlemi için merkez noktasını ayarla
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Görüntüyü kırpılacak alana göre çiz
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // Canvas'ı Blob'a dönüştür
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob); // Blob'u döndür
          } else {
            reject(new Error('Canvas Blob\'a dönüştürülemedi'));
          }
        },
        'image/jpeg', // JPEG formatında
        0.95 // Kalite (0-1 arası)
      );
    };
    image.onerror = (err) => reject(err);
  });
}