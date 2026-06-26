export interface Question {
  id: string;
  numA: number;
  numB: number;
  answer: number;
  isLucky: boolean;
}

const ALLOWED_A = [4, 5, 6, 7, 8, 9, 11, 12];
const ALLOWED_B = [5, 6, 7, 8, 9, 11, 12];

function pick(arr: number[]): number {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateQuestions(count: number = 45): Question[] {
  const luckyIndices = new Set<number>();
  while (luckyIndices.size < Math.min(5, count)) {
    luckyIndices.add(Math.floor(Math.random() * count));
  }

  return Array.from({ length: count }, (_, i) => {
    const numA = pick(ALLOWED_A);
    const numB = pick(ALLOWED_B);
    return {
      id: `q_${i}_${Date.now()}_${Math.random()}`,
      numA,
      numB,
      answer: numA * numB,
      isLucky: luckyIndices.has(i),
    };
  });
}
