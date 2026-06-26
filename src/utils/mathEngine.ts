export interface Question {
  id: string;
  numA: number;
  numB: number;
  answer: number;
}

const ALLOWED_A = [4, 5, 6, 7, 8, 9, 11, 12];
const ALLOWED_B = [5, 6, 7, 8, 9, 11, 12];

function pick(arr: number[]): number {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateQuestions(count: number = 30): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    const numA = pick(ALLOWED_A);
    const numB = pick(ALLOWED_B);

    questions.push({
      id: `q_${i}_${Date.now()}_${Math.random()}`,
      numA,
      numB,
      answer: numA * numB,
    });
  }

  return questions;
}
