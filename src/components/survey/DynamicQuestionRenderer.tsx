import React from 'react';
import { Question, AnswerItem } from '../../types/survey';
import { DynamicChoice } from './DynamicChoice';
import { DynamicNumericSlider } from './DynamicNumericSlider';
import { DynamicRating } from './DynamicRating';
import { DynamicTextInput } from './DynamicTextInput';

interface DynamicQuestionRendererProps {
  question: Question;
  currentAnswer?: AnswerItem;
  onChange: (update: Partial<AnswerItem>) => void;
}

export const DynamicQuestionRenderer: React.FC<DynamicQuestionRendererProps> = ({
  question,
  currentAnswer,
  onChange,
}) => {
  switch (question.question_type) {
    case 'SINGLE_CHOICE':
      return (
        <DynamicChoice
          options={question.options || []}
          isMultiple={false}
          selectedOptionId={currentAnswer?.option_id}
          onSingleSelect={(optId) => onChange({ option_id: optId })}
        />
      );

    case 'MULTIPLE_CHOICE':
      return (
        <DynamicChoice
          options={question.options || []}
          isMultiple={true}
          selectedOptionIds={currentAnswer?.selected_option_ids || []}
          onMultiSelect={(optIds) => onChange({ selected_option_ids: optIds })}
        />
      );

    case 'NUMERIC':
      return (
        <DynamicNumericSlider
          value={currentAnswer?.numeric_value ?? question.min_val ?? 0}
          min={question.min_val}
          max={question.max_val}
          step={question.step_val}
          unit={question.unit}
          onChange={(val) => onChange({ numeric_value: val })}
        />
      );

    case 'RATING':
      return (
        <DynamicRating
          value={currentAnswer?.numeric_value ?? 4}
          min={question.min_val ?? 1}
          max={question.max_val ?? 5}
          unit={question.unit}
          onChange={(val) => onChange({ numeric_value: val })}
        />
      );

    case 'TEXT':
      return (
        <DynamicTextInput
          value={currentAnswer?.text_value || ''}
          isTextArea={false}
          placeholder={question.placeholder}
          onChange={(val) => onChange({ text_value: val })}
        />
      );

    case 'TEXTAREA':
      return (
        <DynamicTextInput
          value={currentAnswer?.text_value || ''}
          isTextArea={true}
          placeholder={question.placeholder}
          onChange={(val) => onChange({ text_value: val })}
        />
      );

    default:
      return (
        <div className="p-4 text-center text-xs text-slate-400">
          Loại câu hỏi chưa được hỗ trợ: {question.question_type}
        </div>
      );
  }
};
