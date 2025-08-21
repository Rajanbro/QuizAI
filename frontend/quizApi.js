import { renderQuestion } from './quizUI.js';
import { startTimer } from './timer.js';

export async function loadQuestion() {
  const elSpinner = document.getElementById("spinner");
  elSpinner.style.display = "block";
  const category = document.getElementById("category").value;
  const difficulty = document.getElementById("difficulty").value;
  const language = document.getElementById("language-selector")?.value || 'en';
  const cacheKey = `questions_${category}_${difficulty}_${language}`;
  try {
    const response = await fetch(`/api/question?category=${category}&difficulty=${difficulty}&language=${language}`);
    const data = await response.json();
    window.currentQ = data;
    renderQuestion(data);
    startTimer();
    // Cache the question
    let cached = JSON.parse(localStorage.getItem(cacheKey) || "[]");
    cached.push(data);
    // Limit cache size to 20 per category/difficulty/language
    if (cached.length > 20) cached = cached.slice(-20);
    localStorage.setItem(cacheKey, JSON.stringify(cached));
  } catch (err) {
    // Try to load from cache
    let cached = JSON.parse(localStorage.getItem(cacheKey) || "[]");
    if (cached.length > 0) {
      // Pick a random cached question
      const data = cached[Math.floor(Math.random() * cached.length)];
      window.currentQ = data;
      renderQuestion(data);
      startTimer();
      document.getElementById("question").textContent += " (Offline Mode)";
    } else {
      document.getElementById("question").textContent = "Failed to load question. No cached questions available.";
      document.getElementById("options").innerHTML = "";
    }
  } finally {
    elSpinner.style.display = "none";
  }
}