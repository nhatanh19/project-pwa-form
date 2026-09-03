import { Question, SurveySubmission } from '../types/survey';
import { OfflineSubmissionRecord } from '../types/sync';
import { formatNumber, formatVND } from './utils';

// Hàm escape chuỗi chuẩn CSV RFC 4180
function escapeCSV(field: unknown): string {
  if (field === null || field === undefined) {
    return '""';
  }
  const str = String(field);
  // Nếu có dấu phẩy, dấu ngoặc kép hoặc xuống dòng -> bọc trong dấu ngoặc kép và nhân đôi dấu ngoặc kép bên trong
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function exportSubmissionsToCSV(
  submissions: (SurveySubmission | OfflineSubmissionRecord)[],
  questions: Question[],
  filenamePrefix = 'khao-sat-thuc-dia'
) {
  if (!submissions || submissions.length === 0) {
    alert('Không có bản ghi khảo sát nào để xuất file.');
    return;
  }

  // 1. Tạo Header Columns
  const headers: string[] = [
    'Mã phiếu khảo sát',
    'Thời điểm bắt đầu',
    'Thời điểm hoàn thành',
    'Thời lượng (giây)',
    'Thời lượng định dạng',
    'Vĩ độ (Latitude)',
    'Kinh độ (Longitude)',
    'Độ chính xác GPS (mét)',
    'Vị trí Google Maps',
    'Trạng thái đồng bộ',
    'Thông tin thiết bị',
  ];

  // Thêm từng câu hỏi làm cột
  questions.forEach((q, idx) => {
    headers.push(`Câu ${idx + 1}: ${q.question_text}`);
  });

  const csvRows: string[] = [];
  csvRows.push(headers.map(escapeCSV).join(','));

  // 2. Tạo Data Rows
  submissions.forEach((sub) => {
    const isSynced = 'is_synced' in sub ? sub.is_synced === 1 : true;
    const lat = sub.location?.latitude ?? null;
    const lng = sub.location?.longitude ?? null;
    const acc = sub.location?.accuracy ?? null;
    const mapsUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : '';

    const durationSec = sub.survey_duration_seconds ?? 0;
    const durationFormatted =
      durationSec > 60
        ? `${Math.floor(durationSec / 60)} phút ${durationSec % 60} giây`
        : `${durationSec} giây`;

    const row: string[] = [
      sub.id,
      new Date(sub.client_created_at).toLocaleString('vi-VN'),
      sub.completed_at ? new Date(sub.completed_at).toLocaleString('vi-VN') : '',
      String(durationSec),
      durationFormatted,
      lat !== null ? String(lat) : 'Không có',
      lng !== null ? String(lng) : 'Không có',
      acc !== null ? `±${acc}m` : 'Không có',
      mapsUrl,
      isSynced ? 'Đã đồng bộ máy chủ' : 'Lưu tạm trong máy (Chờ gửi)',
      sub.device_info || 'PWA Mobile',
    ];

    // Trích xuất câu trả lời cho từng câu hỏi
    questions.forEach((q) => {
      const ans = sub.answers.find((a) => a.question_id === q.id);
      if (!ans) {
        row.push('Chưa trả lời');
        return;
      }

      if (q.question_type === 'SINGLE_CHOICE') {
        const opt = q.options?.find((o) => o.id === ans.option_id);
        row.push(opt?.option_text || 'Chưa chọn');
      } else if (q.question_type === 'MULTIPLE_CHOICE') {
        const opts = q.options?.filter((o) => ans.selected_option_ids?.includes(o.id));
        row.push(opts?.map((o) => o.option_text).join('; ') || 'Chưa chọn');
      } else if (q.question_type === 'NUMERIC') {
        const isVND = q.unit?.toUpperCase().includes('VN') || q.unit?.toUpperCase().includes('Đ');
        const val = ans.numeric_value ?? 0;
        row.push(isVND ? formatVND(val) : `${formatNumber(val)} ${q.unit || ''}`);
      } else if (q.question_type === 'RATING') {
        row.push(`${ans.numeric_value ?? 0} Sao`);
      } else {
        row.push(ans.text_value || '');
      }
    });

    csvRows.push(row.map(escapeCSV).join(','));
  });

  // 3. Ghép chuỗi với UTF-8 BOM (\uFEFF)
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // 4. Trigger Download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}-${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
