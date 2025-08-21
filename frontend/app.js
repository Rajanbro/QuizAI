import { startQuiz, nextQuestion, exportResults, restartQuiz, showFinalScore, reviewAnswers } from './quizHandlers.js';

function saveHighScore(score, total) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  leaderboard.push({ score, total, date: new Date().toLocaleString() });
  leaderboard.sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date));
  if (leaderboard.length > 10) leaderboard.length = 10;
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function showLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  const div = document.getElementById('leaderboard');
  if (!leaderboard.length) {
    div.innerHTML = '<em>No high scores yet.</em>';
  } else {
    div.innerHTML = `<h3>Leaderboard</h3><ol>` +
      leaderboard.map(entry => `<li><b>${entry.score} / ${entry.total}</b> <span style='color:#789'>(${entry.date})</span></li>`).join('') +
      `</ol>`;
  }
  div.classList.add('visible');
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("load-question").addEventListener("click", startQuiz);
  document.getElementById("next-btn").addEventListener("click", nextQuestion);
  document.getElementById("export-results").addEventListener("click", exportResults);
  document.getElementById("restart-quiz").addEventListener("click", restartQuiz);
  document.getElementById("show-final-score").addEventListener("click", showFinalScore);
  document.getElementById("review-answers").addEventListener("click", reviewAnswers);
  document.getElementById('show-leaderboard').addEventListener('click', showLeaderboard);

  const themeToggleBtn = document.getElementById('theme-toggle');

  // Initial text based on current mode
  themeToggleBtn.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';

  // Toggle theme and button text on click
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    themeToggleBtn.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
  });

  document.getElementById('show-final-score').addEventListener('click', () => {
    const score = Number(sessionStorage.getItem('score'));
    const total = Number(sessionStorage.getItem('total'));
    saveHighScore(score, total);
    showLeaderboard();
  });

  document.getElementById('restart-quiz').addEventListener('click', () => {
    document.getElementById('leaderboard').classList.remove('visible');
  });

  document.getElementById('language-selector').addEventListener('change', () => {
    // Reload question in new language
    window.loadQuestion && window.loadQuestion();
  });

  document.getElementById('tts-btn').addEventListener('click', () => {
    const q = document.getElementById('question').textContent;
    const opts = Array.from(document.querySelectorAll('#options li label')).map(l => l.textContent).join('. ');
    const utter = new window.SpeechSynthesisUtterance(q + '. ' + opts);
    window.speechSynthesis.speak(utter);
  });
});
