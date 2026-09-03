-- ============================================================================
-- SQL Aggregation Queries for Analytics & Dashboard
-- Phục vụ cho Endpoint: GET /api/analytics/summary
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. KPI Cards Summary: Tổng số phiếu, Chi phí TB, Điểm đánh giá xe xanh TB
-- ----------------------------------------------------------------------------
SELECT 
    (SELECT COUNT(*) FROM responses WHERE survey_id = 'survey-traffic-2026') AS total_responses,
    (
        SELECT ROUND(AVG(a.numeric_value), 0)
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        WHERE q.id = 'q_monthly_cost' AND a.numeric_value IS NOT NULL
    ) AS avg_monthly_cost,
    (
        SELECT ROUND(AVG(a.numeric_value), 2)
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        WHERE q.id = 'q_green_readiness' AND a.numeric_value IS NOT NULL
    ) AS avg_green_readiness;

-- ----------------------------------------------------------------------------
-- 2. Biểu đồ tròn: Cơ cấu phương tiện di chuyển chính (Câu 1)
-- ----------------------------------------------------------------------------
SELECT 
    o.id AS option_id,
    o.option_text AS transport_mode,
    COUNT(a.id) AS count,
    ROUND(
        COUNT(a.id) * 100.0 / MAX(1, (SELECT COUNT(*) FROM answers sub_a WHERE sub_a.question_id = 'q_transport_mode')), 
        1
    ) AS percentage
FROM options o
LEFT JOIN answers a ON a.option_id = o.id AND a.question_id = 'q_transport_mode'
WHERE o.question_id = 'q_transport_mode'
GROUP BY o.id, o.option_text, o.order_num
ORDER BY o.order_num ASC;

-- ----------------------------------------------------------------------------
-- 3. Biểu đồ phân bổ: Cự ly di chuyển trung bình mỗi ngày (Câu 2)
-- ----------------------------------------------------------------------------
SELECT 
    o.id AS option_id,
    o.option_text AS distance_range,
    COUNT(a.id) AS count,
    ROUND(
        COUNT(a.id) * 100.0 / MAX(1, (SELECT COUNT(*) FROM answers sub_a WHERE sub_a.question_id = 'q_daily_distance')), 
        1
    ) AS percentage
FROM options o
LEFT JOIN answers a ON a.option_id = o.id AND a.question_id = 'q_daily_distance'
WHERE o.question_id = 'q_daily_distance'
GROUP BY o.id, o.option_text, o.order_num
ORDER BY o.order_num ASC;

-- ----------------------------------------------------------------------------
-- 4. Biểu đồ cột: Các lý do chính chọn phương tiện (Câu 4 - Multiple Choice)
-- ----------------------------------------------------------------------------
SELECT 
    o.id AS option_id,
    o.option_text AS reason,
    COUNT(a.id) AS count
FROM options o
LEFT JOIN answers a ON a.option_id = o.id AND a.question_id = 'q_reasons'
WHERE o.question_id = 'q_reasons'
GROUP BY o.id, o.option_text, o.order_num
ORDER BY count DESC;

-- ----------------------------------------------------------------------------
-- 5. Biểu đồ cột / Radar: Phân bổ mức độ sẵn sàng chuyển sang xe xanh (Câu 5 - Rating 1-5 sao)
-- ----------------------------------------------------------------------------
SELECT 
    r.rating_score,
    COUNT(a.id) AS count
FROM (
    SELECT 1 AS rating_score UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) r
LEFT JOIN answers a ON CAST(a.numeric_value AS INTEGER) = r.rating_score AND a.question_id = 'q_green_readiness'
GROUP BY r.rating_score
ORDER BY r.rating_score ASC;
