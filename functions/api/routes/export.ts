import { Hono } from 'hono';
import { Env } from '../../types/env';

export const exportRouter = new Hono<{ Bindings: Env }>();

function escapeCSV(field: unknown): string {
  if (field === null || field === undefined) {
    return '""';
  }
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

exportRouter.get('/csv', async (c) => {
  const surveyId = c.req.query('survey_id') || 'survey-traffic-2026';
  const db = c.env?.DB;

  if (!db) {
    return c.text('Cloudflare D1 chưa được liên kết trong Dashboard', 500);
  }

  try {
    // 1. Lấy danh sách câu hỏi
    const questionsRes = await db
      .prepare('SELECT id, question_text, question_type, unit FROM questions WHERE survey_id = ? ORDER BY order_num ASC')
      .bind(surveyId)
      .all<{ id: string; question_text: string; question_type: string; unit: string | null }>();

    const questions = questionsRes.results || [];

    // 2. Lấy tất cả responses
    const responsesRes = await db
      .prepare(
        `SELECT id, enumerator_id, client_created_at, completed_at, survey_duration_seconds, 
                latitude, longitude, accuracy, photo_data, synced_at, device_info 
         FROM responses 
         WHERE survey_id = ? 
         ORDER BY client_created_at DESC`
      )
      .bind(surveyId)
      .all<{
        id: string;
        enumerator_id: string | null;
        client_created_at: string;
        completed_at: string | null;
        survey_duration_seconds: number | null;
        latitude: number | null;
        longitude: number | null;
        accuracy: number | null;
        photo_data: string | null;
        synced_at: string;
        device_info: string | null;
      }>();

    const responses = responsesRes.results || [];

    // 3. Lấy tất cả answers kèm option_text
    const answersRes = await db
      .prepare(
        `SELECT a.response_id, a.question_id, a.option_id, a.numeric_value, a.text_value, o.option_text
         FROM answers a
         LEFT JOIN options o ON a.option_id = o.id
         JOIN responses r ON a.response_id = r.id
         WHERE r.survey_id = ?`
      )
      .bind(surveyId)
      .all<{
        response_id: string;
        question_id: string;
        option_id: string | null;
        numeric_value: number | null;
        text_value: string | null;
        option_text: string | null;
      }>();

    const answers = answersRes.results || [];

    // Gom answers theo response_id và question_id
    const answerMap = new Map<string, typeof answers>();
    answers.forEach((ans) => {
      const key = `${ans.response_id}_${ans.question_id}`;
      if (!answerMap.has(key)) {
        answerMap.set(key, []);
      }
      answerMap.get(key)!.push(ans);
    });

    // 4. Tạo Header CSV
    const headers = [
      'Mã phiếu',
      'Thời điểm tạo',
      'Thời điểm hoàn thành',
      'Thời lượng (giây)',
      'Vĩ độ (Latitude)',
      'Kinh độ (Longitude)',
      'Độ chính xác GPS (mét)',
      'Vị trí Google Maps',
      'Ảnh khu vực khảo sát',
      'Thời điểm đồng bộ D1',
      'Thiết bị',
    ];

    questions.forEach((q, idx) => {
      headers.push(`Câu ${idx + 1}: ${q.question_text}`);
    });

    const csvRows: string[] = [];
    csvRows.push(headers.map(escapeCSV).join(','));

    // 5. Tạo Data Rows
    responses.forEach((resp) => {
      const mapsUrl = resp.latitude && resp.longitude ? `https://www.google.com/maps?q=${resp.latitude},${resp.longitude}` : '';

      const row: string[] = [
        resp.id,
        resp.client_created_at,
        resp.completed_at || '',
        resp.survey_duration_seconds !== null ? String(resp.survey_duration_seconds) : '',
        resp.latitude !== null ? String(resp.latitude) : '',
        resp.longitude !== null ? String(resp.longitude) : '',
        resp.accuracy !== null ? `±${resp.accuracy}m` : '',
        mapsUrl,
        resp.photo_data ? 'Có ảnh minh chứng' : 'Không chụp',
        resp.synced_at,
        resp.device_info || '',
      ];

      questions.forEach((q) => {
        const key = `${resp.id}_${q.id}`;
        const ansList = answerMap.get(key) || [];

        if (ansList.length === 0) {
          row.push('');
          return;
        }

        if (q.question_type === 'SINGLE_CHOICE') {
          row.push(ansList[0]?.option_text || '');
        } else if (q.question_type === 'MULTIPLE_CHOICE') {
          row.push(ansList.map((a) => a.option_text).filter(Boolean).join('; '));
        } else if (q.question_type === 'NUMERIC') {
          row.push(ansList[0]?.numeric_value !== null ? `${ansList[0]?.numeric_value} ${q.unit || ''}` : '');
        } else if (q.question_type === 'RATING') {
          row.push(ansList[0]?.numeric_value !== null ? `${ansList[0]?.numeric_value} Sao` : '');
        } else {
          row.push(ansList[0]?.text_value || '');
        }
      });

      csvRows.push(row.map(escapeCSV).join(','));
    });

    // 6. Trả về file với UTF-8 BOM
    const csvData = '\uFEFF' + csvRows.join('\r\n');
    const timestamp = new Date().toISOString().slice(0, 10);

    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="khao-sat-toan-bo-${timestamp}.csv"`,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi truy vấn xuất CSV';
    return c.text(`Lỗi xuất file CSV: ${errorMsg}`, 500);
  }
});
