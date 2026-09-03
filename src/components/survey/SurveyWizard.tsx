import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { Question, SurveySubmission, AnswerItem } from '../../types/survey';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { SingleChoice } from './SingleChoice';
import { MultiChoice } from './MultiChoice';
import { CostSlider } from './CostSlider';
import { StarRating } from './StarRating';
import { generateUUID } from '../../lib/utils';

interface SurveyWizardProps {
  surveyId: string;
  questions: Question[];
  onSaveSubmission: (submission: SurveySubmission) => Promise<{ savedOffline: boolean; syncedImmediately: boolean }>;
}

export const SurveyWizard: React.FC<SurveyWizardProps> = ({
  surveyId,
  questions,
  onSaveSubmission,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ savedOffline: boolean; syncedImmediately: boolean } | null>(null);

  // Lưu trữ câu trả lời của form
  const [answersState, setAnswersState] = useState<Record<string, {
    option_id?: string;
    selected_option_ids?: string[];
    numeric_value?: number;
    text_value?: string;
  }>>({
    q_transport_mode: { option_id: 'opt_trans_motorbike' },
    q_daily_distance: { option_id: 'opt_dist_3_7km' },
    q_monthly_cost: { numeric_value: 500000 },
    q_reasons: { selected_option_ids: ['opt_reason_cost', 'opt_reason_flexibility'] },
    q_green_readiness: { numeric_value: 4 },
  });

  const totalSteps = questions.length;
  const currentQuestion = questions[currentStep];
  const progressPercent = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  // Xử lý cập nhật giá trị câu hỏi
  const handleAnswerChange = (questionId: string, update: Partial<AnswerItem>) => {
    setAnswersState((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...update,
      },
    }));
  };

  // Nộp bài khảo sát
  const handleSubmit = async () => {
    setIsSubmitting(true);

    const answersList: AnswerItem[] = Object.entries(answersState).map(([qId, val]) => ({
      question_id: qId,
      option_id: val.option_id,
      selected_option_ids: val.selected_option_ids,
      numeric_value: val.numeric_value,
      text_value: val.text_value,
    }));

    const submission: SurveySubmission = {
      id: generateUUID(),
      survey_id: surveyId,
      client_created_at: new Date().toISOString(),
      answers: answersList,
      device_info: `${navigator.userAgent} (PWA)`,
    };

    const result = await onSaveSubmission(submission);
    setLastSyncResult(result);
    setIsSubmitting(false);
    setIsCompleted(true);

    // Bắn pháo hoa ăn mừng nộp thành công
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore confetti if not supported
    }
  };

  // Reset để khảo sát người tiếp theo
  const handleReset = () => {
    setCurrentStep(0);
    setIsCompleted(false);
    setLastSyncResult(null);
    setAnswersState({
      q_transport_mode: { option_id: 'opt_trans_motorbike' },
      q_daily_distance: { option_id: 'opt_dist_3_7km' },
      q_monthly_cost: { numeric_value: 500000 },
      q_reasons: { selected_option_ids: ['opt_reason_cost', 'opt_reason_flexibility'] },
      q_green_readiness: { numeric_value: 4 },
    });
  };

  // Màn hình hoàn thành nộp phiếu
  if (isCompleted) {
    return (
      <div className="space-y-6 animate-fadeIn pt-4 pb-20">
        <Card className="border-emerald-200 bg-white shadow-lg overflow-hidden text-center">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white flex flex-col items-center justify-center">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-md mb-3">
              <CheckCircle2 className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-2xl font-black">Ghi Nhận Thành Công!</h2>
            <p className="text-emerald-100 text-sm mt-1">
              Phiếu khảo sát thực địa đã được xử lý
            </p>
          </div>

          <CardContent className="p-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-left space-y-2">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Trạng thái lưu trữ dữ liệu:</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lastSyncResult?.syncedImmediately ? (
                  <span className="text-emerald-700 font-medium">
                    Đã đồng bộ trực tiếp lên Cloudflare D1 Server.
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">
                    Đã lưu trữ an toàn trong IndexedDB trên máy (Offline). Hệ thống sẽ tự động đồng bộ khi có kết nối mạng.
                  </span>
                )}
              </p>
            </div>

            <Button
              onClick={handleReset}
              size="lg"
              variant="emerald"
              className="w-full h-14 text-base font-bold shadow-md gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Khảo sát người tiếp theo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center text-slate-500">
        Đang tải dữ liệu câu hỏi khảo sát...
      </div>
    );
  }

  const isLastStep = currentStep === totalSteps - 1;
  const currentAnswer = answersState[currentQuestion.id] || {};

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Progress Header */}
      <div className="space-y-2 px-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span className="bg-slate-200/80 px-2.5 py-1 rounded-full text-slate-800">
            Câu hỏi {currentStep + 1} / {totalSteps}
          </span>
          <span className="text-blue-600 font-extrabold">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Main Question Card */}
      <Card className="shadow-md border-slate-200/80 bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              Mục {currentQuestion.order_num}
            </span>
          </div>
          <CardTitle className="text-lg font-bold text-slate-900 leading-snug pt-2">
            {currentQuestion.question_text}
          </CardTitle>
          {currentQuestion.is_required === 1 && (
            <CardDescription className="text-xs text-amber-600 font-medium">
              * Bắt buộc trả lời
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="pt-5">
          {/* 1. Single Choice */}
          {currentQuestion.question_type === 'SINGLE_CHOICE' && (
            <SingleChoice
              options={currentQuestion.options || []}
              selectedOptionId={currentAnswer.option_id}
              onSelect={(optId) =>
                handleAnswerChange(currentQuestion.id, { option_id: optId })
              }
            />
          )}

          {/* 2. Multiple Choice */}
          {currentQuestion.question_type === 'MULTIPLE_CHOICE' && (
            <MultiChoice
              options={currentQuestion.options || []}
              selectedOptionIds={currentAnswer.selected_option_ids || []}
              onChange={(optIds) =>
                handleAnswerChange(currentQuestion.id, {
                  selected_option_ids: optIds,
                })
              }
            />
          )}

          {/* 3. Numeric Slider */}
          {currentQuestion.question_type === 'NUMERIC' && (
            <CostSlider
              value={currentAnswer.numeric_value ?? 500000}
              min={currentQuestion.min_val ?? 0}
              max={currentQuestion.max_val ?? 5000000}
              step={currentQuestion.step_val ?? 50000}
              unit={currentQuestion.unit ?? 'VNĐ'}
              onChange={(val) =>
                handleAnswerChange(currentQuestion.id, { numeric_value: val })
              }
            />
          )}

          {/* 4. Star Rating */}
          {currentQuestion.question_type === 'RATING' && (
            <StarRating
              value={currentAnswer.numeric_value ?? 4}
              max={currentQuestion.max_val ?? 5}
              onChange={(val) =>
                handleAnswerChange(currentQuestion.id, { numeric_value: val })
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Floating Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200/80 p-3">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="flex-1 h-13 rounded-2xl border-slate-300 font-semibold"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Quay lại
            </Button>
          )}

          {isLastStep ? (
            <Button
              type="button"
              variant="emerald"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-[2] h-13 rounded-2xl font-bold shadow-lg shadow-emerald-700/20 text-base"
            >
              {isSubmitting ? (
                <span>Đang ghi nhận...</span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-5 w-5" />
                  Hoàn thành & Lưu phiếu
                </span>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="flex-[2] h-13 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-900/20 text-base"
            >
              <span>Tiếp theo</span>
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
