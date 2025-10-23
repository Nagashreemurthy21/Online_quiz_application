const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const QUESTIONS_FILE = path.join(__dirname, 'data', 'questions.json');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

app.get('/api/questions', (req, res) => {
  const { category, count } = req.query;
  let questions = readJSON(QUESTIONS_FILE);

  // Filter by category
  if (category && category !== "All") {
    questions = questions.filter(q => q.category === category);
  }

  // Shuffle
  questions = questions.sort(() => Math.random() - 0.5);

  // Limit
  const limit = parseInt(count) || 5;
  questions = questions.slice(0, limit);

  // Hide correct answers
  const safe = questions.map(q => ({
    id: q.id,
    category: q.category,
    question: q.question,
    choices: q.choices
  }));

  res.json({ questions: safe });
});

app.post('/api/score', (req, res) => {
  const { answers } = req.body;
  const allQuestions = readJSON(QUESTIONS_FILE);

  let score = 0;

  answers.forEach(a => {
    const q = allQuestions.find(q => q.id === a.id);
    if (q && q.correctIndex === a.answer) score++;
  });

  res.json({ score });
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
