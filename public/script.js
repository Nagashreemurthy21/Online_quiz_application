const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const goBackBtn = document.getElementById('goBackBtn');

const questionBox = document.getElementById('question-box');
const optionsBox = document.getElementById('options');
const resultText = document.getElementById('result-text');
const timerEl = document.getElementById('timer');
const progressEl = document.getElementById('progress');

let userName = "";
let questions = [];
let current = 0;
let answers = [];
let timer;
let timeLeft = 0;

startBtn.onclick = async () => {
  userName = document.getElementById('name').value.trim() || "Player";
  const category = document.getElementById('category').value;
  const num = document.getElementById('numQuestions').value;

  const res = await fetch(`/api/questions?category=${category}&count=${num}`);
  const data = await res.json();
  questions = data.questions;

  if (questions.length === 0) { alert("No questions found!"); return; }

  startScreen.classList.remove('active');
  quizScreen.classList.add('active');
  current = 0;
  answers = [];

  // Timer: 30 seconds per question
  timeLeft = questions.length * 30;
  updateTimer();
  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) submitQuiz();
  }, 1000);

  showQuestion();
};

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerEl.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

function showQuestion() {
  const q = questions[current];
  progressEl.textContent = `Question ${current+1}/${questions.length}`;
  questionBox.innerHTML = `<h2>${q.question}</h2>`;
  optionsBox.innerHTML = '';

  q.choices.forEach((choice, index) => {
    const div = document.createElement('div');
    div.classList.add('option');
    div.textContent = choice;
    div.onclick = () => selectOption(div, index, q.correctIndex);
    optionsBox.appendChild(div);
  });

  nextBtn.style.display = answers[current] ? 'block' : 'none';
}

function selectOption(div, index, correctIndex){
  // Disable all options after selection
  document.querySelectorAll('.option').forEach(opt => {
    opt.classList.remove('selected');
    opt.style.pointerEvents = 'none';
  });

  // Mark selected
  div.classList.add('selected');

  // Show feedback colors
  if(index === correctIndex){
    div.style.backgroundColor = '#4caf50'; // green
  } else {
    div.style.backgroundColor = '#f44336'; // red
    // highlight correct answer
    document.querySelectorAll('.option')[correctIndex].style.backgroundColor = '#4caf50';
  }

  answers[current] = {id: questions[current].id, answer: index};
  nextBtn.style.display = 'block';
}

nextBtn.onclick = () => {
  if(current < questions.length - 1){
    current++;
    showQuestion();
  } else submitQuiz();
};

async function submitQuiz(){
  clearInterval(timer);

  const res = await fetch('/api/score',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({answers})
  });

  const data = await res.json();
  quizScreen.classList.remove('active');
  resultScreen.classList.add('active');
  resultText.textContent = `${userName}, you scored ${data.score} out of ${questions.length}!`;
}

restartBtn.onclick = () => {
  resultScreen.classList.remove('active');
  startScreen.classList.add('active');
};

goBackBtn.onclick = () => {
  clearInterval(timer);
  quizScreen.classList.remove('active');
  startScreen.classList.add('active');
};
