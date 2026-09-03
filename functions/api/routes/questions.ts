import { Hono } from 'hono';
import { Env, D1PreparedStatement } from '../../types/env';

export const questionsRouter = new Hono<{ Bindings: Env }>();

const FALLBACK_QUESTIONS = [
  {
    id: 'q_transport_mode',
    survey_id: 'survey-traffic-2026',
    order_num: 1,
    question_text: 'Phương tiện di chuyển chính hàng ngày của bạn là gì?',
    description: 'Chọn 1 phương tiện bạn sử dụng nhiều nhất cho công việc/học tập.',
    question_type: 'SINGLE_CHOICE',
    is_required: 1,
    options: [
      { id: 'opt_trans_motorbike', question_id: 'q_transport_mode', option_text: 'Xe máy cá nhân', order_num: 1 },
      { id: 'opt_trans_bus', question_id: 'q_transport_mode', option_text: 'Xe buýt công cộng', order_num: 2 },
      { id: 'opt_trans_bike_walk', question_id: 'q_transport_mode', option_text: 'Xe đạp / Đi bộ', order_num: 3 },
      { id: 'opt_trans_ride_hail', question_id: 'q_transport_mode', option_text: 'Xe công nghệ / Taxi', order_num: 4 },
      { id: 'opt_trans_car', question_id: 'q_transport_mode', option_text: 'Ô tô cá nhân', order_num: 5 },
    ],
  },
  {
    id: 'q_daily_distance',
    survey_id: 'survey-traffic-2026',
    order_num: 2,
    question_text: 'Quãng đường di chuyển trung bình mỗi ngày của bạn?',
    description: 'Tính tổng cả 2 chiều đi và về hàng ngày.',
    question_type: 'SINGLE_CHOICE',
    is_required: 1,
    options: [
      { id: 'opt_dist_under_3km', question_id: 'q_daily_distance', option_text: 'Dưới 3km', order_num: 1 },
      { id: 'opt_dist_3_7km', question_id: 'q_daily_distance', option_text: '3 - 7km', order_num: 2 },
      { id: 'opt_dist_7_15km', question_id: 'q_daily_distance', option_text: '7 - 15km', order_num: 3 },
      { id: 'opt_dist_over_15km', question_id: 'q_daily_distance', option_text: 'Trên 15km', order_num: 4 },
    ],
  },
  {
    id: 'q_monthly_cost',
    survey_id: 'survey-traffic-2026',
    order_num: 3,
    question_text: 'Chi phí xăng xe / vé xe ước tính mỗi tháng của bạn (VNĐ)?',
    description: 'Bao gồm chi phí tiền xăng, vé tháng xe buýt, phí cầu đường...',
    question_type: 'NUMERIC',
    is_required: 1,
    min_val: 0,
    max_val: 5000000,
    step_val: 50000,
    unit: 'VNĐ',
    options: [],
  },
  {
    id: 'q_reasons',
    survey_id: 'survey-traffic-2026',
    order_num: 4,
    question_text: 'Lý do chính bạn ưu tiên sử dụng phương tiện hiện tại?',
    description: 'Có thể chọn nhiều yếu tố quan trọng đối với bạn.',
    question_type: 'MULTIPLE_CHOICE',
    is_required: 1,
    options: [
      { id: 'opt_reason_cost', question_id: 'q_reasons', option_text: 'Tiết kiệm chi phí', order_num: 1 },
      { id: 'opt_reason_time', question_id: 'q_reasons', option_text: 'Tiết kiệm thời gian', order_num: 2 },
      { id: 'opt_reason_flexibility', question_id: 'q_reasons', option_text: 'Tiện lợi / Linh hoạt', order_num: 3 },
      { id: 'opt_reason_safety', question_id: 'q_reasons', option_text: 'An toàn / Tránh mưa nắng', order_num: 4 },
    ],
  },
  {
    id: 'q_green_readiness',
    survey_id: 'survey-traffic-2026',
    order_num: 5,
    question_text: 'Mức độ sẵn sàng chuyển sang phương tiện xanh (Xe điện / Xe buýt điện)?',
    description: 'Thang điểm từ 1 sao (hoàn toàn không sẵn sàng) đến 5 sao (rất ủng hộ).',
    question_type: 'RATING',
    is_required: 1,
    min_val: 1,
    max_val: 5,
    step_val: 1,
    unit: 'Sao',
    options: [],
  },
];

// Hàm tự động kiểm tra và thêm các cột an toàn trong bảng questions
async function ensureQuestionsSchema(db: Env['DB']) {
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
        CREATE TABLE IF NOT EXISTS questions (
          id TEXT PRIMARY KEY,
          survey_id TEXT NOT NULL,
          order_num INTEGER NOT NULL,
          question_text TEXT NOT NULL,
          description TEXT,
          question_type TEXT NOT NULL,
          is_required INTEGER NOT NULL DEFAULT 1,
          min_val REAL,
          max_val REAL,
          step_val REAL DEFAULT 1,
          unit TEXT,
          placeholder TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS options (
          id TEXT PRIMARY KEY,
          question_id TEXT NOT NULL,
          option_text TEXT NOT NULL,
          description TEXT,
          order_num INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `),
    ]);
  } catch (e) {
    console.warn('ensureQuestionsSchema base tables (skipped):', e);
  }

  // Thêm các cột an toàn nếu schema cũ chưa có
  const alterColumns = [
    'ALTER TABLE questions ADD COLUMN description TEXT',
    'ALTER TABLE questions ADD COLUMN placeholder TEXT',
    'ALTER TABLE questions ADD COLUMN min_val REAL',
    'ALTER TABLE questions ADD COLUMN max_val REAL',
    'ALTER TABLE questions ADD COLUMN step_val REAL DEFAULT 1',
    'ALTER TABLE questions ADD COLUMN unit TEXT',
  ];

  for (const query of alterColumns) {
    try {
      await db.prepare(query).run();
    } catch {
      // Bỏ qua nếu cột đã tồn tại
    }
  }
}

// 1. GET /api/questions - Lấy toàn bộ danh mục câu hỏi (Không Cache)
questionsRouter.get('/', async (c) => {
  // Đặt header cấm cache hoàn toàn
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');

  const surveyId = c.req.query('survey_id') || 'survey-traffic-2026';
  const db = c.env?.DB;

  if (!db) {
    return c.json({
      success: true,
      data: {
        id: surveyId,
        title: 'Khảo sát thói quen sử dụng phương tiện di chuyển hàng ngày',
        description: 'Khảo sát thực địa giao thông & phương tiện xanh.',
        is_active: 1,
        questions: FALLBACK_QUESTIONS,
      },
    });
  }

  try {
    await ensureQuestionsSchema(db);

    let survey = await db
      .prepare('SELECT id, title, description, is_active FROM surveys WHERE id = ?')
      .bind(surveyId)
      .first<{ id: string; title: string; description: string; is_active: number }>();

    if (!survey) {
      await autoSeedDatabase(db);
      survey = await db
        .prepare('SELECT id, title, description, is_active FROM surveys WHERE id = ?')
        .bind(surveyId)
        .first<{ id: string; title: string; description: string; is_active: number }>();
    }

    if (!survey) {
      survey = {
        id: surveyId,
        title: 'Khảo sát thói quen sử dụng phương tiện di chuyển hàng ngày',
        description: 'Khảo sát thực địa giao thông & phương tiện xanh.',
        is_active: 1,
      };
    }

    // Truy vấn tất cả câu hỏi trong database
    const questionsRes = await db
      .prepare(
        `SELECT id, survey_id, order_num, question_text, description, question_type, 
                is_required, min_val, max_val, step_val, unit, placeholder 
         FROM questions 
         WHERE survey_id = ? OR survey_id IS NULL OR survey_id = ''
         ORDER BY order_num ASC`
      )
      .bind(surveyId)
      .all<{
        id: string;
        survey_id: string;
        order_num: number;
        question_text: string;
        description: string | null;
        question_type: string;
        is_required: number;
        min_val: number | null;
        max_val: number | null;
        step_val: number | null;
        unit: string | null;
        placeholder: string | null;
      }>();

    const questions = questionsRes.results || [];

    // Nếu chưa có câu hỏi nào trong DB -> Tự động seed
    if (questions.length === 0) {
      await autoSeedDatabase(db);
      return c.json({
        success: true,
        data: {
          id: surveyId,
          title: 'Khảo sát thói quen sử dụng phương tiện di chuyển hàng ngày',
          is_active: 1,
          questions: FALLBACK_QUESTIONS,
        },
      });
    }

    // Truy vấn tất cả options
    const optionsRes = await db
      .prepare(
        'SELECT id, question_id, option_text, description, order_num FROM options ORDER BY order_num ASC'
      )
      .all<{ id: string; question_id: string; option_text: string; description: string | null; order_num: number }>();

    const options = optionsRes.results || [];

    const populatedQuestions = questions.map((q) => ({
      ...q,
      options: options.filter((opt) => opt.question_id === q.id),
    }));

    return c.json({
      success: true,
      data: {
        ...survey,
        questions: populatedQuestions,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Database query error';
    console.error('GET /api/questions error:', err);
    return c.json({
      success: true,
      data: {
        id: surveyId,
        title: 'Khảo sát thói quen sử dụng phương tiện di chuyển hàng ngày',
        is_active: 1,
        questions: FALLBACK_QUESTIONS,
      },
      warning: errorMsg,
    });
  }
});

// 2. POST /api/questions - Thêm câu hỏi mới vào Database
questionsRouter.post('/', async (c) => {
  const db = c.env?.DB;

  try {
    const body = await c.req.json<{
      id?: string;
      survey_id?: string;
      question_text: string;
      description?: string;
      question_type: string;
      is_required?: number;
      min_val?: number;
      max_val?: number;
      step_val?: number;
      unit?: string;
      placeholder?: string;
      options?: { option_text: string; description?: string }[];
    }>();

    if (!body.question_text || !body.question_text.trim()) {
      return c.json({ success: false, message: 'Nội dung câu hỏi không được để trống' }, 400);
    }

    const surveyId = body.survey_id || 'survey-traffic-2026';
    const questionId = body.id || `q_${Date.now()}`;

    // Nếu không có D1 binding (mock environment) -> Vẫn trả về success
    if (!db) {
      return c.json({
        success: true,
        message: 'Tạo mới câu hỏi thành công (Mock Mode)',
        question_id: questionId,
      });
    }

    await ensureQuestionsSchema(db);

    // Tìm order_num cao nhất hiện tại
    const maxOrderRes = await db
      .prepare('SELECT MAX(order_num) AS max_order FROM questions WHERE survey_id = ? OR survey_id IS NULL')
      .bind(surveyId)
      .first<{ max_order: number | null }>();

    const nextOrder = (maxOrderRes?.max_order ?? 0) + 1;

    const statements: D1PreparedStatement[] = [
      db
        .prepare(
          `INSERT INTO questions (
            id, survey_id, order_num, question_text, description, question_type, 
            is_required, min_val, max_val, step_val, unit, placeholder
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          questionId,
          surveyId,
          nextOrder,
          body.question_text.trim(),
          body.description?.trim() || null,
          body.question_type,
          body.is_required ?? 1,
          body.min_val !== undefined ? body.min_val : null,
          body.max_val !== undefined ? body.max_val : null,
          body.step_val !== undefined ? body.step_val : 1,
          body.unit || null,
          body.placeholder || null
        ),
    ];

    // Thêm các lựa chọn (nếu có)
    if (Array.isArray(body.options)) {
      body.options.forEach((opt, idx) => {
        const optId = `opt_${Date.now()}_${idx + 1}`;
        statements.push(
          db
            .prepare(
              `INSERT INTO options (id, question_id, option_text, description, order_num)
               VALUES (?, ?, ?, ?, ?)`
            )
            .bind(optId, questionId, opt.option_text.trim(), opt.description || null, idx + 1)
        );
      });
    }

    await db.batch(statements);

    return c.json({
      success: true,
      message: 'Tạo mới câu hỏi thành công',
      question_id: questionId,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi tạo câu hỏi trên D1';
    console.error('Lỗi POST /api/questions:', err);
    return c.json({ success: false, message: errorMsg }, 500);
  }
});

// 3. DELETE /api/questions/:id - Xóa câu hỏi khỏi Database
questionsRouter.delete('/:id', async (c) => {
  const db = c.env?.DB;
  const questionId = c.req.param('id');

  if (!db) {
    return c.json({ success: true, message: 'Đã xóa câu hỏi (Mock Mode)' });
  }

  try {
    await db.prepare('DELETE FROM questions WHERE id = ?').bind(questionId).run();
    await db.prepare('DELETE FROM options WHERE question_id = ?').bind(questionId).run();
    return c.json({ success: true, message: 'Đã xóa câu hỏi thành công' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi xóa câu hỏi';
    return c.json({ success: false, message: errorMsg }, 500);
  }
});

// Hàm hỗ trợ auto-seed khi D1 mới khởi tạo
async function autoSeedDatabase(db: Env['DB']) {
  try {
    await db.batch([
      // Seed Survey
      db.prepare(`
        INSERT OR REPLACE INTO surveys (id, title, description, is_active)
        VALUES ('survey-traffic-2026', 'Khảo sát thói quen sử dụng phương tiện di chuyển hàng ngày', 'Khảo sát thực địa giao thông & xe xanh.', 1);
      `),
      // Seed Question 1
      db.prepare(`
        INSERT OR REPLACE INTO questions (id, survey_id, order_num, question_text, description, question_type)
        VALUES ('q_transport_mode', 'survey-traffic-2026', 1, 'Phương tiện di chuyển chính hàng ngày của bạn là gì?', 'Chọn 1 phương tiện bạn sử dụng nhiều nhất cho công việc/học tập.', 'SINGLE_CHOICE');
      `),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_trans_motorbike', 'q_transport_mode', 'Xe máy cá nhân', 1);`),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_trans_bus', 'q_transport_mode', 'Xe buýt công cộng', 2);`),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_trans_bike_walk', 'q_transport_mode', 'Xe đạp / Đi bộ', 3);`),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_trans_ride_hail', 'q_transport_mode', 'Xe công nghệ / Taxi', 4);`),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_trans_car', 'q_transport_mode', 'Ô tô cá nhân', 5);`),
      // Seed Question 2
      db.prepare(`
        INSERT OR REPLACE INTO questions (id, survey_id, order_num, question_text, description, question_type)
        VALUES ('q_daily_distance', 'survey-traffic-2026', 2, 'Quãng đường di chuyển trung bình mỗi ngày của bạn?', 'Tính tổng cả 2 chiều đi và về hàng ngày.', 'SINGLE_CHOICE');
      `),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_dist_under_3km', 'q_daily_distance', 'Dưới 3km', 1);`),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_dist_3_7km', 'q_daily_distance', '3 - 7km', 2);`),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_dist_7_15km', 'q_daily_distance', '7 - 15km', 3);`),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_dist_over_15km', 'q_daily_distance', 'Trên 15km', 4);`),
      // Seed Question 3
      db.prepare(`
        INSERT OR REPLACE INTO questions (id, survey_id, order_num, question_text, description, question_type, min_val, max_val, step_val, unit)
        VALUES ('q_monthly_cost', 'survey-traffic-2026', 3, 'Chi phí xăng xe / vé xe ước tính mỗi tháng của bạn (VNĐ)?', 'Bao gồm chi phí tiền xăng, vé tháng xe buýt, phí cầu đường...', 'NUMERIC', 0, 5000000, 50000, 'VNĐ');
      `),
      // Seed Question 4
      db.prepare(`
        INSERT OR REPLACE INTO questions (id, survey_id, order_num, question_text, description, question_type)
        VALUES ('q_reasons', 'survey-traffic-2026', 4, 'Lý do chính bạn ưu tiên sử dụng phương tiện hiện tại?', 'Có thể chọn nhiều yếu tố quan trọng đối với bạn.', 'MULTIPLE_CHOICE');
      `),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_reason_cost', 'q_reasons', 'Tiết kiệm chi phí', 1);`),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_reason_time', 'q_reasons', 'Tiết kiệm thời gian', 2);`),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_reason_flexibility', 'q_reasons', 'Tiện lợi / Linh hoạt', 3);`),
      db.prepare(`INSERT OR REPLACE INTO options (id, question_id, option_text, order_num) VALUES ('opt_reason_safety', 'q_reasons', 'An toàn / Tránh mưa nắng', 4);`),
      // Seed Question 5
      db.prepare(`
        INSERT OR REPLACE INTO questions (id, survey_id, order_num, question_text, description, question_type, min_val, max_val, step_val, unit)
        VALUES ('q_green_readiness', 'survey-traffic-2026', 5, 'Mức độ sẵn sàng chuyển sang phương tiện xanh (Xe điện / Xe buýt điện)?', 'Thang điểm từ 1 sao (hoàn toàn không sẵn sàng) đến 5 sao (rất ủng hộ).', 'RATING', 1, 5, 1, 'Sao');
      `),
    ]);
  } catch (e) {
    console.error('Lỗi khi auto-seed database:', e);
  }
}
