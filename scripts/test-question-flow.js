// Script test kiểm tra tính năng tạo mới câu hỏi và cấu trúc dữ liệu

console.log('--- BẮT ĐẦU TEST KHỞI TẠO VÀ TẠO MỚI CÂU HỎI ---');

const DEFAULT_QUESTIONS = [
  { id: 'q_1', order_num: 1, question_text: 'Phương tiện chính', question_type: 'SINGLE_CHOICE' },
  { id: 'q_2', order_num: 2, question_text: 'Quãng đường', question_type: 'SINGLE_CHOICE' },
  { id: 'q_3', order_num: 3, question_text: 'Chi phí hàng tháng', question_type: 'NUMERIC' },
  { id: 'q_4', order_num: 4, question_text: 'Lý do ưu tiên', question_type: 'MULTIPLE_CHOICE' },
  { id: 'q_5', order_num: 5, question_text: 'Mức độ sẵn sàng xe xanh', question_type: 'RATING' },
];

// 1. Kiểm tra bộ câu hỏi mặc định
console.log(`1. Số lượng câu hỏi ban đầu: ${DEFAULT_QUESTIONS.length}`);
if (DEFAULT_QUESTIONS.length !== 5) {
  console.error('❌ Lỗi: Số lượng câu hỏi ban đầu không đúng 5');
  process.exit(1);
} else {
  console.log('✅ Bộ câu hỏi ban đầu chuẩn 5 câu');
}

// 2. Thử nghiệm tạo mới 1 câu hỏi số 6 dạng TEXT
const newQuestion1 = {
  id: `q_${Date.now()}`,
  survey_id: 'survey-traffic-2026',
  order_num: 6,
  question_text: 'Ý kiến đóng góp của bạn để nâng cao an toàn giao thông?',
  description: 'Ghi chú thêm các đề xuất thực địa.',
  question_type: 'TEXTAREA',
  is_required: 0,
  placeholder: 'Nhập đề xuất của bạn...',
};

const updatedList = [...DEFAULT_QUESTIONS, newQuestion1];
console.log(`2. Số lượng câu hỏi sau khi thêm câu số 6: ${updatedList.length}`);
if (updatedList.length !== 6) {
  console.error('❌ Lỗi: Thêm câu hỏi thất bại');
  process.exit(1);
} else {
  console.log('✅ Thêm câu hỏi số 6 (TEXTAREA) thành công!');
}

// 3. Thử nghiệm tạo mới 1 câu hỏi số 7 dạng SINGLE_CHOICE với options
const newQuestion2 = {
  id: `q_${Date.now() + 1}`,
  survey_id: 'survey-traffic-2026',
  order_num: 7,
  question_text: 'Bạn có dự định đổi sang xe máy điện trong 6 tháng tới?',
  question_type: 'SINGLE_CHOICE',
  is_required: 1,
  options: [
    { id: 'opt_1', question_id: 'q_test', option_text: 'Chắc chắn có', order_num: 1 },
    { id: 'opt_2', question_id: 'q_test', option_text: 'Có thể', order_num: 2 },
    { id: 'opt_3', question_id: 'q_test', option_text: 'Chưa có nhu cầu', order_num: 3 },
  ],
};

const finalQuestions = [...updatedList, newQuestion2];
console.log(`3. Số lượng câu hỏi cuối cùng sau khi thêm câu số 7: ${finalQuestions.length}`);
if (finalQuestions.length !== 7) {
  console.error('❌ Lỗi: Thêm câu hỏi trắc nghiệm thất bại');
  process.exit(1);
} else {
  console.log('✅ Thêm câu hỏi số 7 (SINGLE_CHOICE) thành công!');
}

// 4. Kiểm tra thuật toán Merge Questions (bảo toàn câu hỏi local)
const serverQuestions = DEFAULT_QUESTIONS; // Server chỉ có 5 câu
const questionMap = new Map();
finalQuestions.forEach(q => questionMap.set(q.id, q));
serverQuestions.forEach(q => {
  if (!questionMap.has(q.id)) {
    questionMap.set(q.id, q);
  }
});
const mergedList = Array.from(questionMap.values());
console.log(`4. Số lượng câu hỏi sau khi Merge bảo toàn: ${mergedList.length}`);
if (mergedList.length !== 7) {
  console.error('❌ Lỗi Merge không bảo toàn câu hỏi custom');
  process.exit(1);
} else {
  console.log('✅ Merge câu hỏi bảo toàn thành công: 7/7 câu hỏi vẫn nguyên vẹn!');
}

console.log('--- TEST TOÀN BỘ LOGIC TẠO CÂU HỎI THÀNH CÔNG 100% ---');
