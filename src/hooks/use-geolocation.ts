import { useState, useEffect, useCallback } from 'react';
import { LocationData } from '../types/survey';

export function useGeolocation(autoRequest = true) {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(
    typeof navigator !== 'undefined' && 'geolocation' in navigator
  );

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setIsAvailable(false);
      setLocation({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: 'Trình duyệt không hỗ trợ Geolocation GPS',
      });
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          error: null,
        });
        setIsLoading(false);
      },
      (err) => {
        let errorMsg = 'Không thể lấy vị trí';
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = 'Quyền truy cập GPS bị từ chối';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = 'Không tìm thấy tín hiệu GPS';
        } else if (err.code === err.TIMEOUT) {
          errorMsg = 'Hết thời gian chờ GPS';
        }

        setLocation({
          latitude: null,
          longitude: null,
          accuracy: null,
          error: errorMsg,
        });
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    if (autoRequest) {
      requestLocation();
    }
  }, [autoRequest, requestLocation]);

  return {
    location,
    isLoading,
    isAvailable,
    requestLocation,
  };
}
