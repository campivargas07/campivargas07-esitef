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

export type WpCertificate = {
  ID: number;
  post_author: number;
  post_parent: number;
  post_date: string;
};

export type ExtractedBundle = {
  extractedAt: string;
  users: WpUser[];
  courses: WpCourse[];
  enrollments: WpEnrollment[];
  quizAttempts: WpQuizAttempt[];
  tutorOrders: WpTutorOrder[];
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
