export type WpUser = {
  ID: number;
  user_login: string;
  user_email: string;
  user_pass: string;
  display_name: string;
  user_registered: string;
};

export type WpCourse = {
  ID: number;
  post_name: string;
  post_title: string;
  post_content: string;
  post_excerpt: string;
  post_status: string;
  benefits?: string;
  has_legacy_builder: boolean;
};

export type WpTopic = {
  ID: number;
  course_id: number;
  post_title: string;
  menu_order: number;
  post_status: string;
};

export type WpLesson = {
  ID: number;
  topic_id: number;
  post_title: string;
  post_content: string;
  menu_order: number;
  post_status: string;
  video_url?: string;
  duration_seconds?: number;
};

export type WpCoursePricing = {
  course_id: number;
  price_cents: number;
  currency: string;
  thumbnail_url?: string;
};

export type WpQuiz = {
  ID: number;
  course_id: number;
  post_title: string;
  post_status: string;
};

export type WpQuizQuestion = {
  question_id: number;
  quiz_id: number;
  question_title: string;
  question_type: string;
  question_order: number;
};

export type WpQuizAnswer = {
  answer_id: number;
  question_id: number;
  answer_title: string;
  is_correct: number;
  answer_order: number;
};

export type WpEnrollment = {
  ID: number;
  post_author: number;
  post_parent: number;
  post_date: string;
  post_status: string;
};

export type WpQuizAttempt = {
  attempt_id: number;
  user_id: number;
  quiz_id: number;
  course_id: number;
  earned_marks: number;
  total_marks: number;
  attempt_status: string;
  attempt_started_at: string;
  attempt_ended_at: string;
};

export type WpTutorOrder = {
  id: number;
  user_id: number;
  status: string;
  total_price: string;
  currency: string;
  created_at: string;
};

export type WpWooOrder = {
  id: number;
  customer_id: number;
  status: string;
  total_amount: string;
  currency: string;
  payment_method: string;
  transaction_id: string;
  created_at: string;
};

export type WpWooOrderItem = {
  order_id: number;
  order_item_id: number;
  product_id: number;
  title: string;
  line_total: string;
  quantity: number;
};

export type WpCourseProduct = {
  course_id: number;
  product_id: number;
};

export type WpCertificate = {
  ID: number;
  post_author: number;
  post_parent: number;
  post_date: string;
};

/** Tutor stores lesson completion in wp_usermeta as `_tutor_completed_lesson_id_{lessonId}`. */
export type WpLessonProgress = {
  user_id: number;
  lesson_id: number;
  completed_at?: string;
};

export type ExtractedBundle = {
  extractedAt: string;
  users: WpUser[];
  courses: WpCourse[];
  topics: WpTopic[];
  lessons: WpLesson[];
  coursePricing: WpCoursePricing[];
  quizzes: WpQuiz[];
  quizQuestions: WpQuizQuestion[];
  quizAnswers: WpQuizAnswer[];
  enrollments: WpEnrollment[];
  lessonProgress: WpLessonProgress[];
  quizAttempts: WpQuizAttempt[];
  tutorOrders: WpTutorOrder[];
  wooOrders: WpWooOrder[];
  wooOrderItems: WpWooOrderItem[];
  courseProducts: WpCourseProduct[];
  certificates: WpCertificate[];
};

export type ReconciliationReport = {
  generatedAt: string;
  source: Record<string, number>;
  target: Record<string, number>;
  deltas: Record<string, number>;
  passed: boolean;
  issues: string[];
};
