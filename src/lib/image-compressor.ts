/**
 * Tiện ích nén ảnh thực địa phía client (Canvas Compression)
 * Tự động chuyển đổi ảnh gốc (5MB-15MB) thành ảnh JPEG nhẹ (~80KB-180KB)
 * Đảm bảo lưu trữ IndexedDB nhanh chóng và đồng bộ D1 không bị nghẽn.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 đến 1.0 (mặc định 0.75)
}

export interface CompressedImageResult {
  dataUrl: string; // Base64 Data URL (data:image/jpeg;base64,...)
  sizeKb: number;  // Dung lượng sau nén tính bằng KB
  width: number;   // Chiều rộng ảnh sau nén
  height: number;  // Chiều cao ảnh sau nén
}

export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const { maxWidth = 1280, maxHeight = 1280, quality = 0.75 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Tính toán kích thước mới bảo toàn tỉ lệ khung hình (Aspect Ratio)
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Không thể khởi tạo 2D Canvas context để nén ảnh'));
          return;
        }

        // Vẽ ảnh lên canvas với chất lượng làm mượt tối ưu
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Xuất ra dạng JPEG Base64
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Tính dung lượng ước lượng từ chuỗi Base64
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const sizeInBytes = (base64Length * 3) / 4;
        const sizeKb = Math.round(sizeInBytes / 1024);

        resolve({
          dataUrl,
          sizeKb,
          width,
          height,
        });
      };

      img.onerror = () => {
        reject(new Error('Không thể giải mã file ảnh'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc file từ thiết bị'));
    };

    reader.readAsDataURL(file);
  });
}
