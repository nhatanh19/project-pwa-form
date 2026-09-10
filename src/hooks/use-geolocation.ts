import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { LocationData } from '../types/survey';

export function useGeolocation(autoRequest = true) {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);

    // 1. Trường hợp chạy trên nền tảng Native Mobile (Capacitor Android/iOS)
    if (Capacitor.isNativePlatform()) {
      try {
        let perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') {
          perm = await Geolocation.requestPermissions();
        }

        if (perm.location === 'denied') {
          setLocation({
            latitude: null,
            longitude: null,
            accuracy: null,
            error: 'Quyền truy cập vị trí GPS bị từ chối trong Cài đặt máy',
          });
          setIsLoading(false);
          return;
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        });

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ? Math.round(position.coords.accuracy) : null,
          error: null,
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Không tìm thấy tín hiệu vệ tinh GPS';
        setLocation({
          latitude: null,
          longitude: null,
          accuracy: null,
          error: errorMsg,
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. Trường hợp fallback chạy trên trình duyệt web (Dev mode)
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setIsAvailable(false);
      setLocation({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: 'Thiết bị không hỗ trợ Geolocation GPS',
      });
      setIsLoading(false);
      return;
    }

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
        maximumAge: 5000,
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
