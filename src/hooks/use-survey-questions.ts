import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SURVEY, ensureDefaultSurveySeeded } from '../db/dexie';
import { Survey, Question } from '../types/survey';

export function useSurveyQuestions(surveyId = 'survey-traffic-2026') {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFromCache, setIsFromCache] = useState<boolean>(true);

  // 1. Reactive Live Query: Tự động re-render tức thì mỗi khi IndexedDB thay đổi (Thêm / Sửa / Xóa)
  const liveSurvey = useLiveQuery(() => db.surveys.get(surveyId), [surveyId]);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Đảm bảo dữ liệu local luôn có sẵn
      await ensureDefaultSurveySeeded();

      // 2. Nếu online, fetch trực tiếp từ server với cache-busting timestamp
      if (navigator.onLine) {
        try {
          const timestamp = Date.now();
          const res = await fetch(`/api/questions?survey_id=${surveyId}&_t=${timestamp}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
            },
          });

          if (res.ok) {
            const data: { success: boolean; data: Survey } = await res.json();
            if (data.success && data.data && Array.isArray(data.data.questions) && data.data.questions.length > 0) {
              // Lấy survey hiện tại trong máy để hợp nhất an toàn
              const currentLocal = (await db.surveys.get(surveyId)) || DEFAULT_SURVEY;
              const localQuestions = currentLocal.questions || [];

              // Hợp nhất câu hỏi (Server là nguồn sự thật cho các câu hỏi đã lưu trên server)
              const questionMap = new Map<string, Question>();
              // Đưa các câu hỏi server vào map trước
              data.data.questions.forEach((q) => questionMap.set(q.id, q));
              // Bổ sung các câu hỏi mới tạo trên máy (nếu chưa có trên server)
              localQuestions.forEach((q) => {
                if (!questionMap.has(q.id)) {
                  questionMap.set(q.id, q);
                }
              });

              const mergedList = Array.from(questionMap.values()).sort(
                (a, b) => a.order_num - b.order_num
              );

              const mergedSurvey: Survey = {
                ...currentLocal,
                ...data.data,
                questions: mergedList,
              };

              // Lưu vào IndexedDB -> liveSurvey sẽ tự động cập nhật GUI ngay tức khắc!
              await db.surveys.put(mergedSurvey);
              setIsFromCache(false);
            }
          }
        } catch (netErr) {
          console.warn('Không thể kết nối server để lấy câu hỏi, dùng dữ liệu IndexedDB:', netErr);
        }
      }
    } catch (err) {
      console.error('Lỗi nạp danh sách câu hỏi:', err);
    } finally {
      setIsLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const resolvedSurvey = liveSurvey || DEFAULT_SURVEY;

  return {
    survey: resolvedSurvey,
    questions: resolvedSurvey.questions || [],
    isLoading,
    isFromCache,
    refreshQuestions: fetchQuestions,
  };
}
