export interface Value {
  id: number;
  name: string;
  description: string;
  score: number;
  isCustom: boolean;
  rating?: number;
}

// Constants for the rating system
const K_FACTOR = 32; // How much a single comparison affects scores
const DEFAULT_SCORE = 0; // Starting score for all values

// Initialize all values with a default score
export const standardValues: Value[] = [
  // Standard Values
  {
    id: 1,
    name: "ACCEPTANCE",
    description: "to be accepted as I am",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 2,
    name: "ACCURACY",
    description: "to be accurate in my opinions and beliefs",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 3,
    name: "ACHIEVEMENT",
    description: "to have important accomplishments",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 4,
    name: "ADVENTURE",
    description: "to have new and exciting experiences",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 5,
    name: "ATTRACTIVENESS",
    description: "to be physically attractive",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 6,
    name: "AUTHORITY",
    description: "to be in charge of and responsible for others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 7,
    name: "AUTONOMY",
    description: "to be self-determined and independent",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 8,
    name: "BEAUTY",
    description: "to appreciate beauty around me",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 9,
    name: "CARING",
    description: "to take care of others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 10,
    name: "CHALLENGE",
    description: "to take on difficult tasks and problems",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 11,
    name: "CHANGE",
    description: "to have a life full of change and variety",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 12,
    name: "COMFORT",
    description: "to have a pleasant and comfortable life",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 13,
    name: "COMMITMENT",
    description: "to make enduring, meaningful commitments",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 14,
    name: "COMPASSION",
    description: "to feel and act on concern for others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 15,
    name: "CONTRIBUTION",
    description: "to make a lasting contribution in the world",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 16,
    name: "COOPERATION",
    description: "to work collaboratively with others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 17,
    name: "COURTESY",
    description: "to be considerate and polite toward others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 18,
    name: "CREATIVITY",
    description: "to have new and original ideas",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 19,
    name: "DEPENDABILITY",
    description: "to be reliable and trustworthy",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 20,
    name: "DUTY",
    description: "to carry out my duties and obligations",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 21,
    name: "ECOLOGY",
    description: "to live in harmony with the environment",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 22,
    name: "EXCITEMENT",
    description: "to have a life full of thrills and stimulation",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 23,
    name: "FAITHFULNESS",
    description: "to be loyal and true in relationships",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 24,
    name: "FAME",
    description: "to be known and recognized",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 25,
    name: "FAMILY",
    description: "to have a happy, loving family",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 26,
    name: "FITNESS",
    description: "to be physically fit and strong",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 27,
    name: "FLEXIBILITY",
    description: "to adjust to new circumstances easily",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 28,
    name: "FORGIVENESS",
    description: "to be forgiving of others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 29,
    name: "FRIENDSHIP",
    description: "to have close, supportive friends",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 30,
    name: "FUN",
    description: "to play and have fun",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 31,
    name: "GENEROSITY",
    description: "to give what I have to others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 32,
    name: "GENUINENESS",
    description: "to act in a manner that is true to who I am",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 33,
    name: "GOD'S WILL",
    description: "to seek and obey the will of God",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 34,
    name: "GROWTH",
    description: "to keep changing and growing",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 35,
    name: "HEALTH",
    description: "to be physically well and healthy",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 36,
    name: "HELPFULNESS",
    description: "to be helpful to others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 37,
    name: "HONESTY",
    description: "to be honest and truthful",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 38,
    name: "HOPE",
    description: "to maintain a positive and optimistic outlook",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 39,
    name: "HUMILITY",
    description: "to be modest and unassuming",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 40,
    name: "HUMOR",
    description: "to see the humorous side of myself and the world",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 41,
    name: "INDEPENDENCE",
    description: "to be free from dependence on others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 42,
    name: "INDUSTRY",
    description: "to work hard and well at my life tasks",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 43,
    name: "INNER PEACE",
    description: "to experience personal peace",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 44,
    name: "INTIMACY",
    description: "to share my innermost experiences with others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 45,
    name: "JUSTICE",
    description: "to promote fair and equal treatment for all",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 46,
    name: "KNOWLEDGE",
    description: "to learn and contribute valuable knowledge",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 47,
    name: "LEISURE",
    description: "to take time to relax and enjoy",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 48,
    name: "LOVED",
    description: "to be loved by those close to me",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 49,
    name: "LOVING",
    description: "to give love to others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 50,
    name: "MASTERY",
    description: "to be competent in my everyday activities",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 51,
    name: "MINDFULNESS",
    description: "to live conscious and mindful of the present moment",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 52,
    name: "MODERATION",
    description: "to avoid excesses and find a middle ground",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 53,
    name: "MONOGAMY",
    description: "to have one close, loving relationship",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 54,
    name: "NON-CONFORMITY",
    description: "to question and challenge authority and norms",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 55,
    name: "NURTURANCE",
    description: "to take care of and nurture others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 56,
    name: "OPENNESS",
    description: "to be open to new experiences, ideas, and options",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 57,
    name: "ORDER",
    description: "to have a life that is well-ordered and organized",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 58,
    name: "PASSION",
    description: "to have deep feelings about ideas, activities, or people",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 59,
    name: "PLEASURE",
    description: "to feel good",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 60,
    name: "POPULARITY",
    description: "to be well-liked by many people",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 61,
    name: "POWER",
    description: "to have control over others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 62,
    name: "PURPOSE",
    description: "to have meaning and direction in my life",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 63,
    name: "RATIONALITY",
    description: "to be guided by reason and logic",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 64,
    name: "REALISM",
    description: "to see and act realistically and practically",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 65,
    name: "RESPONSIBILITY",
    description: "to make and carry out responsible decisions",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 66,
    name: "RISK",
    description: "to take risks and chances",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 67,
    name: "ROMANCE",
    description: "to have intense, exciting love in my life",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 68,
    name: "SELF-ACCEPTANCE",
    description: "to accept myself as I am",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 69,
    name: "SAFETY",
    description: "to be safe and secure",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 70,
    name: "SELF-CONTROL",
    description: "to be disciplined in my own actions",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 71,
    name: "SELF-ESTEEM",
    description: "to feel good about myself",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 72,
    name: "SELF-KNOWLEDGE",
    description: "to have a deep and honest understanding of myself",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 73,
    name: "SERVICE",
    description: "to be of service to others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 74,
    name: "SEXUALITY",
    description: "to have an active and satisfying sex life",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 75,
    name: "SIMPLICITY",
    description: "to live life simply, with minimal needs",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 76,
    name: "SOLITUDE",
    description: "to have time and space where I can be apart from others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 77,
    name: "SPIRITUALITY",
    description: "to grow and mature spiritually",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 78,
    name: "STABILITY",
    description: "to have a life that stays fairly consistent",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 79,
    name: "TOLERANCE",
    description: "to accept and respect those who differ from me",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 80,
    name: "TRADITION",
    description: "to follow respected patterns of the past",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 81,
    name: "VIRTUE",
    description: "to live a morally pure and excellent life",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 82,
    name: "WEALTH",
    description: "to have plenty of money",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 83,
    name: "WORLD PEACE",
    description: "to work to promote peace in the world",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  // Additional Values for Meditators and Changemakers
  {
    id: 84,
    name: "PRESENCE",
    description: "to be fully engaged in the current moment",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 85,
    name: "EMOTIONAL INTELLIGENCE",
    description: "to understand and work skillfully with my emotions",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 86,
    name: "CATALYST",
    description: "to initiate positive change in systems and communities",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 87,
    name: "INTEGRITY",
    description: "to align my actions with my deepest values",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 88,
    name: "TRANSMISSION",
    description: "to share my spiritual experience to benefit others",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 89,
    name: "VULNERABILITY",
    description: "to be open about my true feelings and experiences",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 90,
    name: "IMPACT",
    description: "to create lasting positive change in the world",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 91,
    name: "EQUANIMITY",
    description: "to maintain balance amid life's ups and downs",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 92,
    name: "COMMUNITY",
    description: "to be part of a supportive growth-oriented group",
    score: DEFAULT_SCORE,
    isCustom: false
  },
  {
    id: 93,
    name: "AUTHENTICITY",
    description: "to live in alignment with my true nature",
    score: DEFAULT_SCORE,
    isCustom: false
  }
];

// Calculate expected score based on rating difference
function getExpectedScore(rating1: number, rating2: number): number {
  return 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
}

// Update scores based on comparison outcome
export const compareValues = (winner: Value, loser: Value): [Value, Value] => {
  const expectedWinner = getExpectedScore(winner.score, loser.score);
  const expectedLoser = getExpectedScore(loser.score, winner.score);

  // Update winner's score
  const newWinnerScore = winner.score + K_FACTOR * (1 - expectedWinner);

  // Update loser's score
  const newLoserScore = loser.score + K_FACTOR * (0 - expectedLoser);

  return [
    { ...winner, score: Math.round(newWinnerScore) },
    { ...loser, score: Math.round(newLoserScore) }
  ];
};

// Get top N values sorted by score
export const getTopValues = (values: Value[], count: number = 10): Value[] => {
  return [...values]
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
};

// Calculate confidence in ranking based on number of comparisons
export const getRankingConfidence = (values: Value[]): number => {
  const totalPossibleComparisons = (values.length * (values.length - 1)) / 2;
  const actualComparisons = values.reduce((sum, value) =>
    sum + Math.abs(value.score - DEFAULT_SCORE) / K_FACTOR, 0
  );

  return Math.min(actualComparisons / totalPossibleComparisons * 100, 100);
};