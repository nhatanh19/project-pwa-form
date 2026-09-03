import { Hono } from 'hono';
import { Env, D1PreparedStatement } from '../../types/env';

interface AnswerPayload {
  question_id: string;
  option_id?: string;
  selected_option_ids?: string[];
  numeric_value?: number;
  text_value?: string;
}

interface SubmissionPayload {
  id: string;
  survey_id: string;
  enumerator_id?: string;
  client_created_at: string;
  completed_at?: string;
  survey_duration_seconds?: number;
  location?: {
    latitude?: number | null;
    longitude?: number | null;
    accuracy?: number | null;
  };
  answers: AnswerPayload[];
  device_info?: string;
}

export const syncRouter = new Hono<{ Bindings: Env }>();

// Hàm tự động đảm bảo bảng và các cột mới luôn tồn tại trên Cloudflare D1
async function ensureD1Schema(db: Env['DB']) {
  try {
    await db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS surveys (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `),
      db.prepare(`
        INSERT OR IGNORE INTO surveys (id, title, is_active)
        VALUES ('survey-traffic-2026', 'Khảo sát thói quen sử dụng phương tiện di chuyển hàng ngày', 1);
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS responses (
          id TEXT PRIMARY KEY,
          survey_id TEXT NOT NULL,
          enumerator_id TEXT,
          client_created_at TIMESTAMP NOT NULL,
          completed_at TIMESTAMP,
          survey_duration_seconds INTEGER,
          latitude REAL,
          longitude REAL,
          accuracy REAL,
          synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          device_info TEXT
        );
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS answers (
          id TEXT PRIMARY KEY,
          response_id TEXT NOT NULL,
          question_id TEXT NOT NULL,
          option_id TEXT,
          numeric_value REAL,
          text_value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `),
    ]);
  } catch (e) {
    console.warn('ensureD1Schema base tables (skipped):', e);
  }

  // Thêm các cột mới an toàn nếu database cũ chưa có
  const alterQueries = [
    'ALTER TABLE responses ADD COLUMN completed_at TIMESTAMP',
    'ALTER TABLE responses ADD COLUMN survey_duration_seconds INTEGER',
    'ALTER TABLE responses ADD COLUMN latitude REAL',
    'ALTER TABLE responses ADD COLUMN longitude REAL',
    'ALTER TABLE responses ADD COLUMN accuracy REAL',
  ];

  for (const query of alterQueries) {
    try {
      await db.prepare(query).run();
    } catch {
      // Bỏ qua lỗi nếu cột đã tồn tại
    }
  }
}

syncRouter.post('/batch', async (c) => {
  const db = c.env?.DB;

  if (!db) {
    return c.json({
      success: true,
      synced_count: 0,
      message: 'Cloudflare D1 chưa được liên kết trong Dashboard (Mock Synced)',
    });
  }

  try {
    const body = await c.req.json<{ submissions?: SubmissionPayload[] }>();
    const submissions = body.submissions;

    if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
      return c.json({
        success: true,
        synced_count: 0,
        message: 'Không có bản ghi nào cần đồng bộ',
      });
    }

    // 1. Tự động kiểm tra và thêm các cột cần thiết trên D1
    await ensureD1Schema(db);

    const statements: D1PreparedStatement[] = [];

    for (const sub of submissions) {
      // 2. Thêm bản ghi response kèm GPS & Duration (idempotent với INSERT OR IGNORE)
      statements.push(
        db
          .prepare(
            `INSERT OR IGNORE INTO responses (
              id, survey_id, enumerator_id, client_created_at, completed_at, 
              survey_duration_seconds, latitude, longitude, accuracy, synced_at, device_info
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`
          )
          .bind(
            sub.id,
            sub.survey_id || 'survey-traffic-2026',
            sub.enumerator_id || null,
            sub.client_created_at || new Date().toISOString(),
            sub.completed_at || null,
            sub.survey_duration_seconds !== undefined ? sub.survey_duration_seconds : null,
            sub.location?.latitude !== undefined ? sub.location.latitude : null,
            sub.location?.longitude !== undefined ? sub.location.longitude : null,
            sub.location?.accuracy !== undefined ? sub.location.accuracy : null,
            sub.device_info || 'PWA Mobile Client'
          )
      );

      // 3. Thêm từng câu trả lời (answers)
      if (Array.isArray(sub.answers)) {
        for (let i = 0; i < sub.answers.length; i++) {
          const ans = sub.answers[i];

          // Trường hợp chọn nhiều tùy chọn (Multiple Choice)
          if (Array.isArray(ans.selected_option_ids) && ans.selected_option_ids.length > 0) {
            for (const optId of ans.selected_option_ids) {
              const ansId = `${sub.id}_${ans.question_id}_${optId}`;
              statements.push(
                db
                  .prepare(
                    `INSERT OR IGNORE INTO answers (id, response_id, question_id, option_id, numeric_value, text_value)
                     VALUES (?, ?, ?, ?, NULL, NULL)`
                  )
                  .bind(ansId, sub.id, ans.question_id, optId)
              );
            }
          } else {
            // Trường hợp Single Choice, Numeric, Rating, Text
            const ansId = `${sub.id}_${ans.question_id}_${i}`;
            statements.push(
              db
                .prepare(
                  `INSERT OR IGNORE INTO answers (id, response_id, question_id, option_id, numeric_value, text_value)
                   VALUES (?, ?, ?, ?, ?, ?)`
                )
                .bind(
                  ansId,
                  sub.id,
                  ans.question_id,
                  ans.option_id || null,
                  ans.numeric_value !== undefined ? ans.numeric_value : null,
                  ans.text_value || null
                )
            );
          }
        }
      }
    }

    // Thực thi toàn bộ batch trong 1 transaction an toàn
    if (statements.length > 0) {
      await db.batch(statements);
    }

    return c.json({
      success: true,
      synced_count: submissions.length,
      message: `Đồng bộ thành công ${submissions.length} phiếu khảo sát`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi đồng bộ dữ liệu vào D1';
    console.error('Lỗi sync/batch:', err);
    return c.json(
      {
        success: false,
        synced_count: 0,
        message: errorMsg,
      },
      500
    );
  }
});
