export const SECURITY_QUESTIONS: readonly string[] = [
  "What is your childhood nickname or secret code?",
  "What was the name of your first school?",
  "What is your favorite movie, game, or book?",
  "What was the model of your first phone or vehicle?",
  "In which city or town were you born?",
] as const;

export interface SecurityQuestionsInput {
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;
}

export interface PasswordResetInput {
  username: string;
  answer1: string;
  answer2: string;
  newPassword: string;
  confirmPassword?: string;
}

export function normalizeSecurityAnswer(answer: string): string {
  return (answer || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function validateSecurityQuestionsSelection(
  input: SecurityQuestionsInput
): { valid: boolean; error?: string } {
  const q1 = (input.question1 || "").trim();
  const q2 = (input.question2 || "").trim();
  const a1 = normalizeSecurityAnswer(input.answer1);
  const a2 = normalizeSecurityAnswer(input.answer2);

  if (!q1 || !q2) {
    return { valid: false, error: "Please select 2 security questions." };
  }
  if (!SECURITY_QUESTIONS.includes(q1) || !SECURITY_QUESTIONS.includes(q2)) {
    return { valid: false, error: "Selected questions must be from the 5 official security questions." };
  }
  if (q1 === q2) {
    return { valid: false, error: "Please select 2 different security questions." };
  }
  if (a1.length < 2 || a2.length < 2) {
    return { valid: false, error: "Each security answer must be at least 2 characters long." };
  }
  return { valid: true };
}

export function validatePasswordResetInput(
  input: PasswordResetInput
): { valid: boolean; error?: string } {
  const username = (input.username || "").trim();
  const a1 = normalizeSecurityAnswer(input.answer1);
  const a2 = normalizeSecurityAnswer(input.answer2);
  const newPassword = input.newPassword || "";

  if (!username) {
    return { valid: false, error: "Master username is required." };
  }
  if (!a1 || !a2) {
    return { valid: false, error: "Please provide answers for both security questions." };
  }
  if (newPassword.length < 6) {
    return { valid: false, error: "New password must be at least 6 characters long." };
  }
  if (
    typeof input.confirmPassword === "string" &&
    input.confirmPassword !== newPassword
  ) {
    return { valid: false, error: "New password and confirmation password do not match." };
  }
  return { valid: true };
}
