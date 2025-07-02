import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = './server/data';

// Create test data
async function createTestData() {
  // Ensure data directory exists
  await mkdir(DATA_DIR, { recursive: true }).catch(() => {});

  // Create test user
  const hashedPassword = await bcrypt.hash('test123', 10);
  const testUserId = randomUUID();
  const sessionId = randomUUID();
  const valuesSessionId = randomUUID();
  
  const users = [{
    id: testUserId,
    email: 'test@example.com',
    password: hashedPassword,
    createdAt: new Date().toISOString()
  }];

  // Create active session
  const sessions = [{
    id: sessionId,
    userId: testUserId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  }];

  // Create completed values session with top 10 values
  const topValues = [
    { id: 45, name: "INNER HARMONY", description: "to be at peace with myself", rating: 8, score: 12.5, isCustom: false },
    { id: 30, name: "FORGIVENESS", description: "to be forgiving of others", rating: 7, score: 11.8, isCustom: false },
    { id: 47, name: "KNOWLEDGE", description: "to learn and contribute valuable knowledge", rating: 9, score: 11.2, isCustom: false },
    { id: 68, name: "SELF-ACCEPTANCE", description: "to accept myself as I am", rating: 6, score: 10.9, isCustom: false },
    { id: 22, name: "COMPASSION", description: "to feel and act on concern for others", rating: 8, score: 10.5, isCustom: false },
    { id: 56, name: "MINDFULNESS", description: "to live conscious and mindful of the present moment", rating: 9, score: 10.2, isCustom: false },
    { id: 39, name: "HEALTH", description: "to be physically well and healthy", rating: 7, score: 9.8, isCustom: false },
    { id: 10, name: "CARING", description: "to take care of others", rating: 7, score: 9.5, isCustom: false },
    { id: 35, name: "GROWTH", description: "to keep changing and growing", rating: 8, score: 9.1, isCustom: false },
    { id: 42, name: "HUMILITY", description: "to be modest and unassuming", rating: 6, score: 8.7, isCustom: false }
  ];

  // Create a realistic all values array (just the IDs and scores for all 80 values)
  const allValues = [];
  for (let i = 1; i <= 80; i++) {
    const topValue = topValues.find(v => v.id === i);
    allValues.push({
      id: i,
      score: topValue ? topValue.score : Math.random() * 5 - 2.5 // Random scores for non-top values
    });
  }

  const valuesSessions = [{
    id: valuesSessionId,
    userId: testUserId,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 30 minutes later
    topValues: topValues,
    allValues: allValues,
    progress: {
      phase: 'rating' as const,
      completedSets: 71,
      totalSets: 71
    }
  }];

  // Write files
  await writeFile(join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2));
  await writeFile(join(DATA_DIR, 'sessions.json'), JSON.stringify(sessions, null, 2));
  await writeFile(join(DATA_DIR, 'values-sessions.json'), JSON.stringify(valuesSessions, null, 2));

  console.log('Test data created successfully!');
  console.log('Test user email: test@example.com');
  console.log('Test user password: test123');
}

createTestData().catch(console.error);