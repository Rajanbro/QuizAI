document.addEventListener("DOMContentLoaded", () => {
  const API = "/api";
  const elQ = document.getElementById("question");
  const elOpts = document.getElementById("options");
  const elNext = document.getElementById("next-btn");
  const elStatus = document.getElementById("status");
  const elCategory = document.getElementById("category");
  const elSpinner = document.getElementById("spinner");
  const elExportButton = document.getElementById("export-results");
  const elRestartButton = document.getElementById("restart-btn"); // ✅

  let currentQ = null;

  // Initialize score
  if (!sessionStorage.getItem("score")) {
    sessionStorage.setItem("score", "0");
    sessionStorage.setItem("total", "0");
  }

  // Start Quiz
  document.getElementById("load-question").addEventListener("click", async () => {
    sessionStorage.setItem("score", "0");
    sessionStorage.setItem("total", "0");
    elStatus.textContent = "";
    elNext.style.display = "inline-block";
    elRestartButton.style.display = "none"; // ✅ hide restart on new start
    await loadQuestion();
  });

  // Load Next Question
  elNext.addEventListener("click", async () => {
    if (currentQ && currentQ.options) {
      const selected = document.querySelector('input[name="opt"]:checked');
      if (!selected) {
        alert("Please choose an answer!");
        return;
      }

      let score = Number(sessionStorage.getItem("score"));
      let total = Number(sessionStorage.getItem("total"));

      total++;
      if (selected.value === currentQ.correct_answer) {
        score++;
      }

      sessionStorage.setItem("score", score);
      sessionStorage.setItem("total", total);

      elStatus.textContent = `Score: ${score} / ${total}`;
    }

    const response = await fetch(`${API}/question?category=${elCategory.value}`);
    if (!response.ok) {
      elQ.textContent = "No more questions available.";
      elOpts.innerHTML = "";
      elNext.style.display = "none";
      elRestartButton.style.display = "inline-block"; // ✅ show restart when quiz ends
      return;
    }

    const data = await response.json();
    currentQ = data;
    renderQuestion(data);
  });

  // Export Results
  elExportButton.addEventListener("click", () => {
    const score = sessionStorage.getItem("score");
    const total = sessionStorage.getItem("total");
    const resultsText = `GRE Quiz Results:\nScore: ${score} / ${total}`;
    const blob = new Blob([resultsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gre_quiz_results.txt";
    a.click();
  });

  // Restart Quiz
  elRestartButton.addEventListener("click", () => {
    sessionStorage.setItem("score", "0");
    sessionStorage.setItem("total", "0");
    elStatus.textContent = "";
    elQ.textContent = "Click \"Start Quiz\" to begin.";
    elOpts.innerHTML = "";
    elRestartButton.style.display = "none";
    elNext.style.display = "none";
  });

  // Fetch and render question
  async function loadQuestion() {
    elSpinner.style.display = "block";

    try {
      const category = elCategory.value;
      const response = await fetch(`${API}/question?category=${category}`);
      if (!response.ok) throw new Error("No questions");

      const data = await response.json();
      currentQ = data;
      renderQuestion(data);
    } catch (err) {
      elQ.textContent = "No more questions available.";
      elOpts.innerHTML = "";
      elNext.style.display = "none";
      elRestartButton.style.display = "inline-block";
    } finally {
      elSpinner.style.display = "none";
    }
  }

  function renderQuestion(q) {
    elQ.textContent = q.question;
    elOpts.innerHTML = "";

    if (q.options) {
      q.options.forEach(opt => {
        const li = document.createElement("li");
        li.innerHTML = `
          <label>
            <input type="radio" name="opt" value="${opt}"> ${opt}
          </label>`;
        elOpts.appendChild(li);
      });
      elNext.style.display = "inline-block";
    } else {
      elNext.style.display = "none";
      elOpts.innerHTML = "";
    }
  }
});
