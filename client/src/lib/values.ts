export interface Value {
  id: number;
  name: string;
  description: string;
  score: number;
  isCustom: boolean;
  rating?: number;
}

export const standardValues: Value[] = [
  // Standard Values
  {
    id: 1,
    name: "ACCEPTANCE",
    description: "to be accepted as I am",
    score: 0,
    isCustom: false
  },
  {
    id: 2,
    name: "ACCURACY",
    description: "to be accurate in my opinions and beliefs",
    score: 0,
    isCustom: false
  },
  {
    id: 3,
    name: "ACHIEVEMENT",
    description: "to have important accomplishments",
    score: 0,
    isCustom: false
  },
  {
    id: 4,
    name: "ADVENTURE",
    description: "to have new and exciting experiences",
    score: 0,
    isCustom: false
  },
  {
    id: 5,
    name: "ATTRACTIVENESS",
    description: "to be physically attractive",
    score: 0,
    isCustom: false
  },
  {
    id: 6,
    name: "AUTHORITY",
    description: "to be in charge of and responsible for others",
    score: 0,
    isCustom: false
  },
  {
    id: 7,
    name: "AUTONOMY",
    description: "to be self-determined and independent",
    score: 0,
    isCustom: false
  },
  {
    id: 8,
    name: "BEAUTY",
    description: "to appreciate beauty around me",
    score: 0,
    isCustom: false
  },
  {
    id: 9,
    name: "CARING",
    description: "to take care of others",
    score: 0,
    isCustom: false
  },
  {
    id: 10,
    name: "CHALLENGE",
    description: "to take on difficult tasks and problems",
    score: 0,
    isCustom: false
  },
  {
    id: 11,
    name: "CHANGE",
    description: "to have a life full of change and variety",
    score: 0,
    isCustom: false
  },
  {
    id: 12,
    name: "COMFORT",
    description: "to have a pleasant and comfortable life",
    score: 0,
    isCustom: false
  },
  {
    id: 13,
    name: "COMMITMENT",
    description: "to make enduring, meaningful commitments",
    score: 0,
    isCustom: false
  },
  {
    id: 14,
    name: "COMPASSION",
    description: "to feel and act on concern for others",
    score: 0,
    isCustom: false
  },
  {
    id: 15,
    name: "CONTRIBUTION",
    description: "to make a lasting contribution in the world",
    score: 0,
    isCustom: false
  },
  {
    id: 16,
    name: "COOPERATION",
    description: "to work collaboratively with others",
    score: 0,
    isCustom: false
  },
  {
    id: 17,
    name: "COURTESY",
    description: "to be considerate and polite toward others",
    score: 0,
    isCustom: false
  },
  {
    id: 18,
    name: "CREATIVITY",
    description: "to have new and original ideas",
    score: 0,
    isCustom: false
  },
  {
    id: 19,
    name: "DEPENDABILITY",
    description: "to be reliable and trustworthy",
    score: 0,
    isCustom: false
  },
  {
    id: 20,
    name: "DUTY",
    description: "to carry out my duties and obligations",
    score: 0,
    isCustom: false
  },
  {
    id: 21,
    name: "ECOLOGY",
    description: "to live in harmony with the environment",
    score: 0,
    isCustom: false
  },
  {
    id: 22,
    name: "EXCITEMENT",
    description: "to have a life full of thrills and stimulation",
    score: 0,
    isCustom: false
  },
  {
    id: 23,
    name: "FAITHFULNESS",
    description: "to be loyal and true in relationships",
    score: 0,
    isCustom: false
  },
  {
    id: 24,
    name: "FAME",
    description: "to be known and recognized",
    score: 0,
    isCustom: false
  },
  {
    id: 25,
    name: "FAMILY",
    description: "to have a happy, loving family",
    score: 0,
    isCustom: false
  },
  {
    id: 26,
    name: "FITNESS",
    description: "to be physically fit and strong",
    score: 0,
    isCustom: false
  },
  {
    id: 27,
    name: "FLEXIBILITY",
    description: "to adjust to new circumstances easily",
    score: 0,
    isCustom: false
  },
  {
    id: 28,
    name: "FORGIVENESS",
    description: "to be forgiving of others",
    score: 0,
    isCustom: false
  },
  {
    id: 29,
    name: "FRIENDSHIP",
    description: "to have close, supportive friends",
    score: 0,
    isCustom: false
  },
  {
    id: 30,
    name: "FUN",
    description: "to play and have fun",
    score: 0,
    isCustom: false
  },
  {
    id: 31,
    name: "GENEROSITY",
    description: "to give what I have to others",
    score: 0,
    isCustom: false
  },
  {
    id: 32,
    name: "GENUINENESS",
    description: "to act in a manner that is true to who I am",
    score: 0,
    isCustom: false
  },
  {
    id: 33,
    name: "GOD'S WILL",
    description: "to seek and obey the will of God",
    score: 0,
    isCustom: false
  },
  {
    id: 34,
    name: "GROWTH",
    description: "to keep changing and growing",
    score: 0,
    isCustom: false
  },
  {
    id: 35,
    name: "HEALTH",
    description: "to be physically well and healthy",
    score: 0,
    isCustom: false
  },
  {
    id: 36,
    name: "HELPFULNESS",
    description: "to be helpful to others",
    score: 0,
    isCustom: false
  },
  {
    id: 37,
    name: "HONESTY",
    description: "to be honest and truthful",
    score: 0,
    isCustom: false
  },
  {
    id: 38,
    name: "HOPE",
    description: "to maintain a positive and optimistic outlook",
    score: 0,
    isCustom: false
  },
  {
    id: 39,
    name: "HUMILITY",
    description: "to be modest and unassuming",
    score: 0,
    isCustom: false
  },
  {
    id: 40,
    name: "HUMOR",
    description: "to see the humorous side of myself and the world",
    score: 0,
    isCustom: false
  },
  {
    id: 41,
    name: "INDEPENDENCE",
    description: "to be free from dependence on others",
    score: 0,
    isCustom: false
  },
  {
    id: 42,
    name: "INDUSTRY",
    description: "to work hard and well at my life tasks",
    score: 0,
    isCustom: false
  },
  {
    id: 43,
    name: "INNER PEACE",
    description: "to experience personal peace",
    score: 0,
    isCustom: false
  },
  {
    id: 44,
    name: "INTIMACY",
    description: "to share my innermost experiences with others",
    score: 0,
    isCustom: false
  },
  {
    id: 45,
    name: "JUSTICE",
    description: "to promote fair and equal treatment for all",
    score: 0,
    isCustom: false
  },
  {
    id: 46,
    name: "KNOWLEDGE",
    description: "to learn and contribute valuable knowledge",
    score: 0,
    isCustom: false
  },
  {
    id: 47,
    name: "LEISURE",
    description: "to take time to relax and enjoy",
    score: 0,
    isCustom: false
  },
  {
    id: 48,
    name: "LOVED",
    description: "to be loved by those close to me",
    score: 0,
    isCustom: false
  },
  {
    id: 49,
    name: "LOVING",
    description: "to give love to others",
    score: 0,
    isCustom: false
  },
  {
    id: 50,
    name: "MASTERY",
    description: "to be competent in my everyday activities",
    score: 0,
    isCustom: false
  },
  {
    id: 51,
    name: "MINDFULNESS",
    description: "to live conscious and mindful of the present moment",
    score: 0,
    isCustom: false
  },
  {
    id: 52,
    name: "MODERATION",
    description: "to avoid excesses and find a middle ground",
    score: 0,
    isCustom: false
  },
  {
    id: 53,
    name: "MONOGAMY",
    description: "to have one close, loving relationship",
    score: 0,
    isCustom: false
  },
  {
    id: 54,
    name: "NON-CONFORMITY",
    description: "to question and challenge authority and norms",
    score: 0,
    isCustom: false
  },
  {
    id: 55,
    name: "NURTURANCE",
    description: "to take care of and nurture others",
    score: 0,
    isCustom: false
  },
  {
    id: 56,
    name: "OPENNESS",
    description: "to be open to new experiences, ideas, and options",
    score: 0,
    isCustom: false
  },
  {
    id: 57,
    name: "ORDER",
    description: "to have a life that is well-ordered and organized",
    score: 0,
    isCustom: false
  },
  {
    id: 58,
    name: "PASSION",
    description: "to have deep feelings about ideas, activities, or people",
    score: 0,
    isCustom: false
  },
  {
    id: 59,
    name: "PLEASURE",
    description: "to feel good",
    score: 0,
    isCustom: false
  },
  {
    id: 60,
    name: "POPULARITY",
    description: "to be well-liked by many people",
    score: 0,
    isCustom: false
  },
  {
    id: 61,
    name: "POWER",
    description: "to have control over others",
    score: 0,
    isCustom: false
  },
  {
    id: 62,
    name: "PURPOSE",
    description: "to have meaning and direction in my life",
    score: 0,
    isCustom: false
  },
  {
    id: 63,
    name: "RATIONALITY",
    description: "to be guided by reason and logic",
    score: 0,
    isCustom: false
  },
  {
    id: 64,
    name: "REALISM",
    description: "to see and act realistically and practically",
    score: 0,
    isCustom: false
  },
  {
    id: 65,
    name: "RESPONSIBILITY",
    description: "to make and carry out responsible decisions",
    score: 0,
    isCustom: false
  },
  {
    id: 66,
    name: "RISK",
    description: "to take risks and chances",
    score: 0,
    isCustom: false
  },
  {
    id: 67,
    name: "ROMANCE",
    description: "to have intense, exciting love in my life",
    score: 0,
    isCustom: false
  },
  {
    id: 68,
    name: "SELF-ACCEPTANCE",
    description: "to accept myself as I am",
    score: 0,
    isCustom: false
  },
  {
    id: 69,
    name: "SAFETY",
    description: "to be safe and secure",
    score: 0,
    isCustom: false
  },
  {
    id: 70,
    name: "SELF-CONTROL",
    description: "to be disciplined in my own actions",
    score: 0,
    isCustom: false
  },
  {
    id: 71,
    name: "SELF-ESTEEM",
    description: "to feel good about myself",
    score: 0,
    isCustom: false
  },
  {
    id: 72,
    name: "SELF-KNOWLEDGE",
    description: "to have a deep and honest understanding of myself",
    score: 0,
    isCustom: false
  },
  {
    id: 73,
    name: "SERVICE",
    description: "to be of service to others",
    score: 0,
    isCustom: false
  },
  {
    id: 74,
    name: "SEXUALITY",
    description: "to have an active and satisfying sex life",
    score: 0,
    isCustom: false
  },
  {
    id: 75,
    name: "SIMPLICITY",
    description: "to live life simply, with minimal needs",
    score: 0,
    isCustom: false
  },
  {
    id: 76,
    name: "SOLITUDE",
    description: "to have time and space where I can be apart from others",
    score: 0,
    isCustom: false
  },
  {
    id: 77,
    name: "SPIRITUALITY",
    description: "to grow and mature spiritually",
    score: 0,
    isCustom: false
  },
  {
    id: 78,
    name: "STABILITY",
    description: "to have a life that stays fairly consistent",
    score: 0,
    isCustom: false
  },
  {
    id: 79,
    name: "TOLERANCE",
    description: "to accept and respect those who differ from me",
    score: 0,
    isCustom: false
  },
  {
    id: 80,
    name: "TRADITION",
    description: "to follow respected patterns of the past",
    score: 0,
    isCustom: false
  },
  {
    id: 81,
    name: "VIRTUE",
    description: "to live a morally pure and excellent life",
    score: 0,
    isCustom: false
  },
  {
    id: 82,
    name: "WEALTH",
    description: "to have plenty of money",
    score: 0,
    isCustom: false
  },
  {
    id: 83,
    name: "WORLD PEACE",
    description: "to work to promote peace in the world",
    score: 0,
    isCustom: false
  },
  // Additional Values for Meditators and Changemakers
  {
    id: 84,
    name: "PRESENCE",
    description: "to be fully engaged in the current moment",
    score: 0,
    isCustom: false
  },
  {
    id: 85,
    name: "EMOTIONAL INTELLIGENCE",
    description: "to understand and work skillfully with my emotions",
    score: 0,
    isCustom: false
  },
  {
    id: 86,
    name: "CATALYST",
    description: "to initiate positive change in systems and communities",
    score: 0,
    isCustom: false
  },
  {
    id: 87,
    name: "INTEGRITY",
    description: "to align my actions with my deepest values",
    score: 0,
    isCustom: false
  },
  {
    id: 88,
    name: "TRANSMISSION",
    description: "to share my spiritual experience to benefit others",
    score: 0,
    isCustom: false
  },
  {
    id: 89,
    name: "VULNERABILITY",
    description: "to be open about my true feelings and experiences",
    score: 0,
    isCustom: false
  },
  {
    id: 90,
    name: "IMPACT",
    description: "to create lasting positive change in the world",
    score: 0,
    isCustom: false
  },
  {
    id: 91,
    name: "EQUANIMITY",
    description: "to maintain balance amid life's ups and downs",
    score: 0,
    isCustom: false
  },
  {
    id: 92,
    name: "COMMUNITY",
    description: "to be part of a supportive growth-oriented group",
    score: 0,
    isCustom: false
  },
  {
    id: 93,
    name: "AUTHENTICITY",
    description: "to live in alignment with my true nature",
    score: 0,
    isCustom: false
  }
];

export const compareValues = (val1: Value, val2: Value): Value => {
  // Simple comparison - could be enhanced with AI in future
  if (val1.score > val2.score) return val1;
  if (val2.score > val1.score) return val2;
  return Math.random() > 0.5 ? val1 : val2;
};

export const getTopValues = (values: Value[], count: number = 10): Value[] => {
  return [...values].sort((a, b) => b.score - a.score).slice(0, count);
};