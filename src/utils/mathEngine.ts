export interface Question {
  id: string;
  numA: number;
  numB: number;
  answer: number;
}

export function generateQuestions(count: number = 40): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    // Generate A between 4 and 12
    const numA = Math.floor(Math.random() * (12 - 4 + 1)) + 4;

    // Generate B between 5 and 12
    const numB = Math.floor(Math.random() * (12 - 5 + 1)) + 5;

    questions.push({
      id: `q_${i}_${Date.now()}_${Math.random()}`,
      numA,
      numB,
      answer: numA * numB,
    });
  }

  return questions;
}
