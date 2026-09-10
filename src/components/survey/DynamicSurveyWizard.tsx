import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  ClipboardList,
  MapPin,
  Clock,
  Navigation,
} from 'lucide-react';
import { Question, SurveySubmission, AnswerItem } from '../../types/survey';
import { useGeolocation } from '../../hooks/use-geolocation';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { QuestionCard } from './QuestionCard';
import { DynamicQuestionRenderer } from './DynamicQuestionRenderer';
import { SurveySummaryReview } from './SurveySummaryReview';
import { generateUUID, cn } from '../../lib/utils';
import { triggerHaptic } from '../../lib/native-haptics';
import { Card, CardContent } from '../ui/card';

interface DynamicSurveyWizardProps {
  surveyId: string;
  questions: Question[];
  onSaveSubmission: (submission: SurveySubmission) => Promise<{ savedOffline: boolean; syncedImmediately: boolean }>;
  onViewDashboard?: () => void;
}

export const DynamicSurveyWizard: React.FC<DynamicSurveyWizardProps> = ({
  surveyId,
  questions = [],
  onSaveSubmission,
  onViewDashboard,
}) => {
  // currentStep: 0 đến questions.length - 1 (các câu hỏi), questions.length = màn hình tóm tắt review
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ savedOffline: boolean; syncedImmediately: boolean } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Lưu thời điểm bắt đầu khảo sát để tính thời lượng
  const [surveyStartTime, setSurveyStartTime] = useState<number>(Date.now());

  // Tự động thu thập tọa độ GPS thực địa
  const { location, isLoading: isGpsLoading, requestLocation } = useGeolocation(true);

  // State lưu trữ các câu trả lời
  const [answersState, setAnswersState] = useState<Record<string, AnswerItem>>({});

  // State lưu trữ ảnh chụp khu vực khảo sát (Base64 Data URL)
  const [photoData, setPhotoData] = useState<string | null>(null);

  const stepperRef = useRef<HTMLDivElement>(null);

  // Tự động khởi tạo giá trị mặc định cho từng câu hỏi khi questions thay đổi
  useEffect(() => {
    if (questions.length > 0) {
      setAnswersState((prev) => {
        const next = { ...prev };
        questions.forEach((q) => {
          if (!next[q.id]) {
            if (q.question_type === 'SINGLE_CHOICE' && q.options && q.options.length > 0) {
              next[q.id] = { question_id: q.id, option_id: q.options[0].id };
            } else if (q.question_type === 'MULTIPLE_CHOICE' && q.options && q.options.length > 0) {
              next[q.id] = { question_id: q.id, selected_option_ids: [q.options[0].id] };
            } else if (q.question_type === 'NUMERIC') {
              next[q.id] = { question_id: q.id, numeric_value: q.min_val ?? 500000 };
            } else if (q.question_type === 'RATING') {
              next[q.id] = { question_id: q.id, numeric_value: 4 };
            } else {
              next[q.id] = { question_id: q.id, text_value: '' };
            }
          }
        });
        return next;
      });
    }
  }, [questions]);

  // Cuộn stepper theo bước hiện tại
  useEffect(() => {
    if (stepperRef.current) {
      const activeBtn = stepperRef.current.children[currentStep] as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentStep]);

  const totalQuestions = questions.length;
  const isReviewStep = currentStep === totalQuestions;
  const currentQuestion = !isReviewStep ? questions[currentStep] : null;

  const progressPercent = totalQuestions > 0
    ? Math.min(100, Math.round(((currentStep + 1) / (totalQuestions + 1)) * 100))
    : 0;

  // Cập nhật câu trả lời
  const handleAnswerChange = (update: Partial<AnswerItem>) => {
    if (!currentQuestion) return;
    setValidationError(null);
    setAnswersState((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        ...update,
        question_id: currentQuestion.id,
      },
    }));
  };

  // Xác thực câu hỏi bắt buộc trước khi chuyển bước
  const validateCurrentStep = (): boolean => {
    if (!currentQuestion) return true;
    if (currentQuestion.is_required !== 1) return true;

    const ans = answersState[currentQuestion.id];
    if (!ans) {
      setValidationError('Vui lòng trả lời câu hỏi này trước khi tiếp tục.');
      return false;
    }

    if (currentQuestion.question_type === 'SINGLE_CHOICE' && !ans.option_id) {
      setValidationError('Vui lòng chọn 1 phương án.');
      return false;
    }

    if (
      currentQuestion.question_type === 'MULTIPLE_CHOICE' &&
      (!ans.selected_option_ids || ans.selected_option_ids.length === 0)
    ) {
      setValidationError('Vui lòng chọn ít nhất 1 phương án.');
      return false;
    }

    if (
      (currentQuestion.question_type === 'TEXT' || currentQuestion.question_type === 'TEXTAREA') &&
      (!ans.text_value || ans.text_value.trim().length === 0)
    ) {
      setValidationError('Vui lòng nhập nội dung câu trả lời.');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      triggerHaptic.warning();
      return;
    }
    triggerHaptic.light();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.min(totalQuestions, prev + 1));
  };

  const handlePrev = () => {
    triggerHaptic.light();
    setValidationError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleJumpToStep = (stepIndex: number) => {
    triggerHaptic.selection();
    setValidationError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(stepIndex);
  };

  // Nộp bài khảo sát (Ghi nhận GPS & Thời lượng chính xác)
  const handleSubmit = async () => {
    setIsSubmitting(true);

    const now = Date.now();
    const durationSeconds = Math.max(1, Math.round((now - surveyStartTime) / 1000));
    const answersList: AnswerItem[] = Object.values(answersState);

    const submission: SurveySubmission = {
      id: generateUUID(),
      survey_id: surveyId,
      client_created_at: new Date(surveyStartTime).toISOString(),
      completed_at: new Date(now).toISOString(),
      survey_duration_seconds: durationSeconds,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        error: location.error,
      },
      photo_data: photoData,
      answers: answersList,
      device_info: `${navigator.userAgent} (Capacitor Native)`,
    };

    const result = await onSaveSubmission(submission);
    setLastSyncResult(result);
    setIsSubmitting(false);
    setIsCompleted(true);
    triggerHaptic.success();

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore confetti
    }
  };

  // Khởi tạo lại form cho người khảo sát tiếp theo
  const handleReset = () => {
    triggerHaptic.medium();
    setCurrentStep(0);
    setIsCompleted(false);
    setLastSyncResult(null);
    setValidationError(null);
    setPhotoData(null);
    setSurveyStartTime(Date.now());
    requestLocation(); // Làm mới vị trí GPS cho lượt khảo sát mới

    // Reset default
    const resetAnswers: Record<string, AnswerItem> = {};
    questions.forEach((q) => {
      if (q.question_type === 'SINGLE_CHOICE' && q.options && q.options.length > 0) {
        resetAnswers[q.id] = { question_id: q.id, option_id: q.options[0].id };
      } else if (q.question_type === 'MULTIPLE_CHOICE' && q.options && q.options.length > 0) {
        resetAnswers[q.id] = { question_id: q.id, selected_option_ids: [q.options[0].id] };
      } else if (q.question_type === 'NUMERIC') {
        resetAnswers[q.id] = { question_id: q.id, numeric_value: q.min_val ?? 500000 };
      } else if (q.question_type === 'RATING') {
        resetAnswers[q.id] = { question_id: q.id, numeric_value: 4 };
      } else {
        resetAnswers[q.id] = { question_id: q.id, text_value: '' };
      }
    });
    setAnswersState(resetAnswers);
  };

  // Màn hình hoàn thành nộp phiếu
  if (isCompleted) {
    return (
      <div className="space-y-4 animate-fadeIn pt-2 pb-28">
        <Card className="border-emerald-200 bg-white shadow-xl rounded-3xl overflow-hidden text-center">
          {/* Top Banner */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white flex flex-col items-center justify-center">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-md mb-3 ring-4 ring-white/10">
              <CheckCircle2 className="h-14 w-14 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Ghi Nhận Thành Công!</h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Phiếu khảo sát thực địa đã được bảo toàn an toàn
            </p>
          </div>

          {/* Status Details */}
          <CardContent className="p-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-left space-y-2.5">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Trạng thái dữ liệu:</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lastSyncResult?.syncedImmediately ? (
                  <span className="text-emerald-700 font-semibold">
                    🟢 Đã đồng bộ trực tiếp lên máy chủ đám mây.
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">
                    🟡 Đã lưu trữ an toàn trong IndexedDB trên thiết bị. Hệ thống sẽ tự động đồng bộ khi có kết nối mạng.
                  </span>
                )}
              </p>

              {/* Tọa độ GPS đã ghi nhận */}
              {location.latitude && location.longitude && (
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium pt-1 border-t border-slate-200/60">
                  <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>
                    GPS: {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}° (±{location.accuracy}m)
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Button
                onClick={handleReset}
                size="lg"
                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base shadow-md gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Khảo sát người tiếp theo</span>
              </Button>

              {onViewDashboard && (
                <Button
                  onClick={onViewDashboard}
                  variant="outline"
                  size="lg"
                  className="w-full h-13 rounded-2xl border-slate-300 text-slate-800 font-bold text-sm"
                >
                  <ClipboardList className="h-4 w-4 mr-1.5 text-blue-600" />
                  <span>Xem báo cáo thống kê</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Đang tải danh sách câu hỏi khảo sát...
      </div>
    );
  }

  const isLastQuestion = currentStep === totalQuestions - 1;

  return (
    <div className="space-y-4 pt-2 pb-44">
      {/* 1. GPS & Live Metadata Info Bar */}
      <div className="flex items-center justify-between px-1 text-[11px] font-bold">
        {/* GPS Badge */}
        <div className="flex items-center space-x-1.5 rounded-full bg-white px-2.5 py-1 border border-slate-200/80 shadow-xs text-slate-600">
          <Navigation className={`h-3 w-3 ${isGpsLoading ? 'animate-spin text-amber-500' : 'text-blue-600'}`} />
          {location.latitude && location.longitude ? (
            <span className="text-emerald-700">
              GPS: {location.latitude.toFixed(3)}°, {location.longitude.toFixed(3)}° (±{location.accuracy}m)
            </span>
          ) : isGpsLoading ? (
            <span className="text-amber-600">Đang tìm GPS...</span>
          ) : (
            <span className="text-slate-400">GPS chưa bật</span>
          )}
        </div>

        {/* Live Timer */}
        <div className="flex items-center space-x-1 text-slate-500 font-semibold">
          <Clock className="h-3 w-3 text-slate-400" />
          <span>Thời gian thực địa</span>
        </div>
      </div>

      {/* 2. Stepper & Progress Header */}
      <div className="space-y-2 px-1">
        {/* Top Progress Info */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span className="bg-slate-200/80 px-3 py-1 rounded-full text-slate-800">
            {isReviewStep ? 'Kiểm tra & Nộp' : `Tiến độ: ${currentStep + 1} / ${totalQuestions}`}
          </span>
          <span className="text-blue-600 font-extrabold">{progressPercent}%</span>
        </div>

        <Progress value={progressPercent} className="h-2 rounded-full" />

        {/* Scrollable Pill Stepper (Chạm để nhảy câu hỏi) */}
        <div
          ref={stepperRef}
          className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none no-scrollbar"
        >
          {questions.map((q, idx) => {
            const isCurrent = currentStep === idx;
            const isAnswered = !!answersState[q.id];

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleJumpToStep(idx)}
                className={cn(
                  'flex h-8 min-w-[2rem] px-2.5 items-center justify-center rounded-xl text-xs font-black transition-all touch-manipulation shrink-0',
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105 ring-2 ring-blue-600/20'
                    : isAnswered
                    ? 'bg-blue-100/80 text-blue-800 hover:bg-blue-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                )}
              >
                {idx + 1}
              </button>
            );
          })}

          {/* Review Pill */}
          <button
            type="button"
            onClick={() => handleJumpToStep(totalQuestions)}
            className={cn(
              'flex h-8 px-3 items-center justify-center rounded-xl text-xs font-bold transition-all touch-manipulation shrink-0',
              isReviewStep
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Tóm tắt
          </button>
        </div>
      </div>

      {/* 3. Main Question Card OR Review Step */}
      {isReviewStep ? (
        <SurveySummaryReview
          questions={questions}
          answersState={answersState}
          photoData={photoData}
          onPhotoCaptured={setPhotoData}
          onEditStep={handleJumpToStep}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      ) : currentQuestion ? (
        <QuestionCard
          question={currentQuestion}
          currentIndex={currentStep}
          totalCount={totalQuestions}
          errorMessage={validationError}
        >
          <DynamicQuestionRenderer
            question={currentQuestion}
            currentAnswer={answersState[currentQuestion.id]}
            onChange={handleAnswerChange}
          />
        </QuestionCard>
      ) : null}

      {/* 4. Unified Bottom Navigation Action Bar */}
      {!isReviewStep && (
        <div className="fixed bottom-[64px] left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2.5 shadow-lg">
          <div className="mx-auto flex max-w-lg items-center gap-2.5">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handlePrev}
                className="w-28 sm:w-32 h-12 rounded-2xl border-slate-300 font-bold text-slate-700 text-xs sm:text-sm shrink-0 px-2"
              >
                <ChevronLeft className="h-4 w-4 mr-0.5" />
                <span>Quay lại</span>
              </Button>
            )}

            <Button
              type="button"
              size="lg"
              onClick={handleNext}
              className="flex-1 min-w-0 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold shadow-lg shadow-slate-900/15 text-xs sm:text-sm px-3"
            >
              <span className="truncate whitespace-nowrap">
                {isLastQuestion ? 'Xem tóm tắt' : 'Tiếp theo'}
              </span>
              <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
