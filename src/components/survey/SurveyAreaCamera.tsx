import React, { useRef, useState } from 'react';
import { Camera as CameraIcon, Image as ImageIcon, Trash2, RefreshCw, ZoomIn, X, CheckCircle2 } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { compressImageFile } from '../../lib/image-compressor';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface SurveyAreaCameraProps {
  photoData: string | null;
  onPhotoCaptured: (dataUrl: string | null) => void;
  isOptional?: boolean;
}

export const SurveyAreaCamera: React.FC<SurveyAreaCameraProps> = ({
  photoData,
  onPhotoCaptured,
  isOptional = true,
}) => {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [photoSizeKb, setPhotoSizeKb] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chụp ảnh bằng @capacitor/camera (Native Mobile) hoặc fallback Web Input
  const handleCapturePhoto = async (sourceType: 'camera' | 'photos') => {
    setErrorMsg(null);

    if (Capacitor.isNativePlatform()) {
      try {
        setIsProcessing(true);
        const image = await Camera.getPhoto({
          quality: 75,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: sourceType === 'camera' ? CameraSource.Camera : CameraSource.Photos,
          width: 1280,
          height: 1280,
          promptLabelHeader: 'Chọn ảnh khu vực khảo sát',
          promptLabelPhoto: 'Chọn từ thư viện ảnh',
          promptLabelPicture: 'Chụp ảnh mới',
        });

        if (image.base64String) {
          const format = image.format || 'jpeg';
          const dataUrl = `data:image/${format};base64,${image.base64String}`;
          const sizeKb = Math.round((image.base64String.length * 3) / 4 / 1024);
          setPhotoSizeKb(sizeKb);
          onPhotoCaptured(dataUrl);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Người dùng hủy hoặc không thể chụp ảnh';
        // Người dùng ấn hủy chọn ảnh trên Android thì bỏ qua không báo lỗi
        if (!msg.toLowerCase().includes('cancel') && !msg.toLowerCase().includes('user cancelled')) {
          setErrorMsg(msg);
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Fallback trên trình duyệt máy tính
      if (sourceType === 'camera') {
        cameraInputRef.current?.click();
      } else {
        galleryInputRef.current?.click();
      }
    }
  };

  // Fallback web file change
  const handleWebFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const result = await compressImageFile(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.75,
      });

      setPhotoSizeKb(result.sizeKb);
      onPhotoCaptured(result.dataUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể nén ảnh chụp';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    onPhotoCaptured(null);
    setPhotoSizeKb(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-2">
      {/* Hidden file inputs for Web fallback */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleWebFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleWebFileChange}
        className="hidden"
      />

      <Card className="border-slate-200/90 bg-white shadow-xs rounded-2xl overflow-hidden">
        <CardContent className="p-3.5 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CameraIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                  Ảnh Khu Vực Khảo Sát
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isOptional ? 'Minh chứng thực địa (Tùy chọn)' : 'Bắt buộc chụp ảnh'}
                </p>
              </div>
            </div>

            {photoData && (
              <span className="inline-flex items-center space-x-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3 w-3" />
                <span>Đã chụp</span>
              </span>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center justify-center space-x-2 py-6 text-xs text-blue-700 font-bold bg-blue-50/60 rounded-xl border border-blue-100">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span>Đang xử lý & nén ảnh camera native...</span>
            </div>
          )}

          {/* Photo Preview when exists */}
          {!isProcessing && photoData && (
            <div className="space-y-2">
              <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-950 aspect-video max-h-48 flex items-center justify-center">
                <img
                  src={photoData}
                  alt="Ảnh hiện trường khảo sát"
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-102"
                  onClick={() => setIsLightboxOpen(true)}
                />

                {/* Overlay action on hover/touch */}
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <span className="flex items-center space-x-1 text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs">
                    <ZoomIn className="h-3.5 w-3.5" />
                    <span>Xem phóng to</span>
                  </span>
                </div>

                {/* Size Badge */}
                {photoSizeKb && (
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                    ~{photoSizeKb} KB
                  </span>
                )}
              </div>

              {/* Action Buttons: Zoom, Retake, Delete */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLightboxOpen(true)}
                  className="h-8 flex-1 rounded-xl text-xs font-bold border-slate-300 gap-1"
                >
                  <ZoomIn className="h-3.5 w-3.5 text-blue-600" />
                  <span>Phóng to</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCapturePhoto('camera')}
                  className="h-8 flex-1 rounded-xl text-xs font-bold border-slate-300 gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-amber-600" />
                  <span>Chụp lại</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePhoto}
                  className="h-8 px-2.5 rounded-xl text-xs font-bold border-slate-300 text-red-600 hover:bg-red-50 gap-1"
                  title="Xóa ảnh này"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Empty State: Prompt to take or pick photo */}
          {!isProcessing && !photoData && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCapturePhoto('camera')}
                className="h-11 rounded-xl border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-transform"
              >
                <CameraIcon className="h-4 w-4 text-blue-600" />
                <span>Chụp bằng Camera</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleCapturePhoto('photos')}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-transform"
              >
                <ImageIcon className="h-4 w-4 text-slate-500" />
                <span>Chọn từ thư viện</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Full-screen Modal */}
      {isLightboxOpen && photoData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-lg w-full flex flex-col max-h-[90vh]">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-bold text-slate-300">
                Ảnh thực địa khu vực khảo sát
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Photo */}
            <div className="flex-1 overflow-hidden rounded-2xl bg-black flex items-center justify-center">
              <img
                src={photoData}
                alt="Ảnh phóng to"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Bottom Info */}
            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-400">
                Đã tối ưu chuẩn nén JPEG {photoSizeKb ? `(~${photoSizeKb} KB)` : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
