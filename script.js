const DIFFICULTY_LABELS = {
  easy: "하",
  medium: "중",
  hard: "상"
};

const state = {
  practiceMode: false,
  currentDifficulty: null,
  currentQuestions: [],
  currentIndex: 0,
  selectedAnswer: null,
  correctCount: 0
};

const homeScreen = document.getElementById("home-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const practiceToggle = document.getElementById("practice-toggle");
const difficultyLabel = document.getElementById("difficulty-label");
const progressLabel = document.getElementById("progress-label");
const quizQuestion = document.getElementById("quiz-question");
const optionsContainer = document.getElementById("options-container");
const selectedAnswer = document.getElementById("selected-answer");
const feedbackMessage = document.getElementById("feedback-message");
const nextButton = document.getElementById("next-button");
const homeButton = document.getElementById("home-button");
const restartButton = document.getElementById("restart-button");
const resultHomeButton = document.getElementById("result-home-button");
const totalCount = document.getElementById("total-count");
const correctCount = document.getElementById("correct-count");
const scoreText = document.getElementById("score-text");

function showScreen(screenToShow) {
  [homeScreen, quizScreen, resultScreen].forEach((screen) => {
    const isActive = screen === screenToShow;
    screen.hidden = !isActive;
    screen.classList.toggle("active", isActive);
  });
}

function shuffleCopy(items) {
  const copiedItems = [...items];

  for (let index = copiedItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copiedItems[index], copiedItems[randomIndex]] = [copiedItems[randomIndex], copiedItems[index]];
  }

  return copiedItems;
}

function getQuestionsByDifficulty(difficulty) {
  if (!window.QUESTIONS && typeof QUESTIONS === "undefined") {
    return [];
  }

  const questionSource = typeof QUESTIONS !== "undefined" ? QUESTIONS : window.QUESTIONS;
  return Array.isArray(questionSource[difficulty]) ? questionSource[difficulty] : [];
}

function startQuiz(difficulty) {
  const questions = getQuestionsByDifficulty(difficulty);
  state.currentDifficulty = difficulty;
  state.currentQuestions = shuffleCopy(questions).map((question) => ({
    ...question,
    shuffledOptions: shuffleCopy(question.options || [])
  }));
  state.currentIndex = 0;
  state.selectedAnswer = null;
  state.correctCount = 0;

  showScreen(quizScreen);

  if (state.currentQuestions.length === 0) {
    renderEmptyState(difficulty);
    return;
  }

  renderQuestion();
}

function renderEmptyState(difficulty) {
  difficultyLabel.textContent = `난이도: ${DIFFICULTY_LABELS[difficulty] || "-"}`;
  progressLabel.textContent = "0 / 0";
  quizQuestion.textContent = "아직 등록된 문제가 없습니다.";
  optionsContainer.replaceChildren();
  selectedAnswer.textContent = "";
  feedbackMessage.hidden = true;
  feedbackMessage.textContent = "";
  nextButton.disabled = true;
}

function renderQuestion() {
  const currentQuestion = state.currentQuestions[state.currentIndex];
  state.selectedAnswer = null;

  difficultyLabel.textContent = `난이도: ${DIFFICULTY_LABELS[state.currentDifficulty] || "-"}`;
  progressLabel.textContent = `${state.currentIndex + 1} / ${state.currentQuestions.length}`;
  quizQuestion.textContent = currentQuestion.question;
  selectedAnswer.textContent = "";
  feedbackMessage.hidden = true;
  feedbackMessage.textContent = "";
  nextButton.disabled = true;
  nextButton.textContent = state.currentIndex === state.currentQuestions.length - 1 ? "결과 보기" : "다음 문제";

  // 다음 문제와 정답이 화면에 미리 노출되지 않도록 현재 문제의 보기만 DOM에 렌더링합니다.
  const optionButtons = currentQuestion.shuffledOptions.map((option) => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => selectAnswer(option, button));
    return button;
  });

  optionsContainer.replaceChildren(...optionButtons);
}

function selectAnswer(answer, selectedButton) {
  const currentQuestion = state.currentQuestions[state.currentIndex];
  state.selectedAnswer = answer;
  selectedAnswer.textContent = `선택한 답안: ${answer}`;
  nextButton.disabled = false;

  optionsContainer.querySelectorAll(".option-button").forEach((button) => {
    button.classList.toggle("selected", button === selectedButton);
  });

  if (state.practiceMode) {
    const isCorrect = answer === currentQuestion.answer;
    feedbackMessage.hidden = false;
    feedbackMessage.className = `feedback-message ${isCorrect ? "correct" : "wrong"}`;
    feedbackMessage.textContent = isCorrect ? "정답입니다!" : `오답입니다. 정답은 ${currentQuestion.answer}입니다.`;
  }
}

function moveToNextStep() {
  if (!state.selectedAnswer) {
    return;
  }

  const currentQuestion = state.currentQuestions[state.currentIndex];
  if (state.selectedAnswer === currentQuestion.answer) {
    state.correctCount += 1;
  }

  if (state.currentIndex >= state.currentQuestions.length - 1) {
    renderResult();
    return;
  }

  state.currentIndex += 1;
  renderQuestion();
}

function renderResult() {
  const total = state.currentQuestions.length;
  const score = total > 0 ? Math.round((state.correctCount / total) * 100) : 0;

  totalCount.textContent = total;
  correctCount.textContent = state.correctCount;
  scoreText.textContent = `${score}점`;
  showScreen(resultScreen);
}

function returnHome() {
  state.currentDifficulty = null;
  state.currentQuestions = [];
  state.currentIndex = 0;
  state.selectedAnswer = null;
  state.correctCount = 0;
  showScreen(homeScreen);
}

function togglePracticeMode() {
  state.practiceMode = !state.practiceMode;
  practiceToggle.setAttribute("aria-checked", String(state.practiceMode));
  practiceToggle.classList.toggle("on", state.practiceMode);
  practiceToggle.querySelector(".toggle-text").textContent = state.practiceMode ? "ON" : "OFF";
}

function bindEvents() {
  document.querySelectorAll(".difficulty-button").forEach((button) => {
    button.addEventListener("click", () => startQuiz(button.dataset.difficulty));
  });

  practiceToggle.addEventListener("click", togglePracticeMode);
  nextButton.addEventListener("click", moveToNextStep);
  homeButton.addEventListener("click", returnHome);
  resultHomeButton.addEventListener("click", returnHome);
  restartButton.addEventListener("click", () => {
    if (state.currentDifficulty) {
      startQuiz(state.currentDifficulty);
    } else {
      returnHome();
    }
  });
}

bindEvents();
