import test from "node:test";
import assert from "node:assert/strict";
import {
  SECURITY_QUESTIONS,
  normalizeSecurityAnswer,
  validateSecurityQuestionsSelection,
  validatePasswordResetInput,
} from "./securityQuestions";

test("SECURITY_QUESTIONS pool has exactly 5 distinct questions", () => {
  assert.equal(SECURITY_QUESTIONS.length, 5);
  assert.equal(new Set(SECURITY_QUESTIONS).size, 5);
});

test("normalizeSecurityAnswer trims and lowercases consistently", () => {
  assert.equal(normalizeSecurityAnswer("  My   School  "), "my school");
});

test("validateSecurityQuestionsSelection enforces 2 distinct questions from the 5 pool", () => {
  const dup = validateSecurityQuestionsSelection({
    question1: SECURITY_QUESTIONS[0],
    answer1: "alpha",
    question2: SECURITY_QUESTIONS[0],
    answer2: "beta",
  });
  assert.equal(dup.valid, false);

  const valid = validateSecurityQuestionsSelection({
    question1: SECURITY_QUESTIONS[0],
    answer1: "Alpha",
    question2: SECURITY_QUESTIONS[2],
    answer2: "Interstellar",
  });
  assert.equal(valid.valid, true);
});

test("validatePasswordResetInput validates answers and password confirmation", () => {
  const mismatch = validatePasswordResetInput({
    username: "Admin",
    answer1: "alpha",
    answer2: "beta",
    newPassword: "NewPassword@123",
    confirmPassword: "DifferentPassword@123",
  });
  assert.equal(mismatch.valid, false);

  const valid = validatePasswordResetInput({
    username: "Admin",
    answer1: "alpha",
    answer2: "beta",
    newPassword: "Shivam@9533",
    confirmPassword: "Shivam@9533",
  });
  assert.equal(valid.valid, true);
});
