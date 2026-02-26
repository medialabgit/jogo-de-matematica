/* ========================================================
   Jogo de Matemática — game.js
   ======================================================== */

// ─── Translations ───────────────────────────────────────
const translations = {
  pt: {
    title: "Jogo de Matemática",
    play: "Jogar",
    settings: "Configurações",
    language: "Idioma",
    team1: "Equipa 1",
    team2: "Equipa 2",
    time: "Tempo",
    difficulty: "Dificuldade",
    operation: "Operações",
    pointsToWin: "Pontos para vencer",
    save: "Guardar",
    back: "Voltar",
    playAgain: "Jogar novamente",
    resultTitleWin: "Vencedor:",
    draw: "Empate!",
    correct: "Correctas",
    attempted: "Tentadas",
    accuracy: "Precisão",
    level: "Nível",
    mode: "Modo",
    opAdd: "Soma",
    opSub: "Subtração",
    opMul: "Multiplicação",
    opDiv: "Divisão",
    opMix: "Mistura",
    training: "Modo treino (sem tempo)",
    footerAbout: "👤 Sobre o autor",
    modalClose: "Fechar",
    modalBio: "Analista e Desenvolvedor de Sistemas | Multidisciplinar.<br>Fundador do <a href=\"https://mundodeahlam.com\" target=\"_blank\" rel=\"noopener\" style=\"color:var(--blue-dark);font-weight:700;text-decoration:none\">Mundo de Ahlam</a>",
    modalPitchTag: "🤖",
    modalPitchText: "aldrinosmar",
    modalPitchCta: "Formações para a sua organização ou escola →",
    modalCC: "— Livre para usar, partilhar e adaptar, desde que preserve os direitos do autor."
  },

  en: {
    title: "Math Game",
    play: "Play",
    settings: "Settings",
    language: "Language",
    team1: "Team 1",
    team2: "Team 2",
    time: "Time",
    difficulty: "Difficulty",
    operation: "Operations",
    pointsToWin: "Points to win",
    save: "Save",
    back: "Back",
    playAgain: "Play again",
    resultTitleWin: "Winner:",
    draw: "It's a draw!",
    correct: "Correct",
    attempted: "Attempted",
    accuracy: "Accuracy",
    level: "Level",
    mode: "Mode",
    opAdd: "Addition",
    opSub: "Subtraction",
    opMul: "Multiplication",
    opDiv: "Division",
    opMix: "Mixed",
    training: "Training mode (no timer)",
    footerAbout: "👤 About the author",
    modalClose: "Close",
    modalBio: "Systems Analyst and Developer | Multidisciplinary.<br>Founder of <a href=\"https://mundodeahlam.com\" target=\"_blank\" rel=\"noopener\" style=\"color:var(--blue-dark);font-weight:700;text-decoration:none\">Mundo de Ahlam</a>",
    modalPitchTag: "🤖",
    modalPitchText: "aldrinosmar",
    modalPitchCta: "Training for your organisation or school →",
    modalCC: "— Free to use, share and adapt, provided attribution is preserved."
  },

  fr: {
    title: "Jeu de Mathématiques",
    play: "Jouer",
    settings: "Paramètres",
    language: "Langue",
    team1: "Équipe 1",
    team2: "Équipe 2",
    time: "Temps",
    difficulty: "Difficulté",
    operation: "Opérations",
    pointsToWin: "Points pour gagner",
    save: "Sauvegarder",
    back: "Retour",
    playAgain: "Rejouer",
    resultTitleWin: "Gagnant :",
    draw: "Égalité !",
    correct: "Correctes",
    attempted: "Tentées",
    accuracy: "Précision",
    level: "Niveau",
    mode: "Mode",
    opAdd: "Addition",
    opSub: "Soustraction",
    opMul: "Multiplication",
    opDiv: "Division",
    opMix: "Mélange",
    training: "Mode entraînement (sans temps)",
    footerAbout: "👤 À propos de l'auteur",
    modalClose: "Fermer",
    modalBio: "Analyste et Développeur de Systèmes | Multidisciplinaire.<br>Fondateur de <a href=\"https://mundodeahlam.com\" target=\"_blank\" rel=\"noopener\" style=\"color:var(--blue-dark);font-weight:700;text-decoration:none\">Mundo de Ahlam</a>",
    modalPitchTag: "🤖",
    modalPitchText: "aldrinosmar",
    modalPitchCta: "Formations pour votre organisation ou école →",
    modalCC: "— Libre d'utilisation, de partage et d'adaptation avec attribution."
  }
};

// ─── Config ─────────────────────────────────────────────
let config = {
  language: "pt",
  operationMode: "mixed",
  difficulty: 1,
  roundTimeSeconds: 60,
  pointsToWin: 5
};

// ─── Teams state ────────────────────────────────────────
let teams = [
  { score: 0, attempted: 0, currentQuestion: null, answerBuffer: "" },
  { score: 0, attempted: 0, currentQuestion: null, answerBuffer: "" }
];

let timerInterval = null;
let timeRemaining = 0;
let gameRunning = false;
let soundEnabled = true;

// ─── Audio (Web Audio API) ──────────────────────────────
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration, type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.13;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

function soundCorrect() {
  playTone(660, 0.1, "sine");
  setTimeout(() => playTone(880, 0.12, "sine"), 80);
  setTimeout(() => playTone(1100, 0.15, "sine"), 160);
}
function soundWrong() { playTone(200, 0.35, "square"); }

// ─── DOM helpers ────────────────────────────────────────
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ─── Config persistence ─────────────────────────────────
function loadConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem("mathTugConfig"));
    if (saved) Object.assign(config, saved);
  } catch (_) {}
}

function saveConfig() {
  localStorage.setItem("mathTugConfig", JSON.stringify(config));
}

// ─── i18n ───────────────────────────────────────────────
function t(key) {
  return (translations[config.language] || translations.pt)[key] || key;
}

function applyLanguage() {
  $$("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
  $$("[data-i18n-html]").forEach(el => {
    const key = el.getAttribute("data-i18n-html");
    el.innerHTML = t(key);
  });
  $$("[data-i18n-aria]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria");
    el.setAttribute("aria-label", t(key));
  });
  $$("#cfg-operation option").forEach(opt => {
    const k = opt.getAttribute("data-i18n-opt");
    if (k) opt.textContent = t(k);
  });
  $$("#cfg-time option[data-i18n-opt]").forEach(opt => {
    const k = opt.getAttribute("data-i18n-opt");
    if (k) opt.textContent = t(k);
  });
  $$(".lang-btn").forEach(b => b.classList.toggle("active", b.dataset.lang === config.language));
  document.title = t("title");
}

function setLanguage(lang) {
  config.language = lang;
  saveConfig();
  applyLanguage();
}

// ─── Screen navigation ─────────────────────────────────
function showScreen(id) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
}

// ─── Question generation ────────────────────────────────
function difficultyRange() {
  if (config.difficulty === 1) return 10;
  if (config.difficulty === 2) return 50;
  return 100;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  const max = difficultyRange();
  const ops = ["+", "−", "×", "÷"];
  let op;

  switch (config.operationMode) {
    case "addition":       op = "+"; break;
    case "subtraction":    op = "−"; break;
    case "multiplication": op = "×"; break;
    case "division":       op = "÷"; break;
    default:               op = ops[randInt(0, 3)];
  }

  let a, b, answer;

  if (op === "+") {
    a = randInt(0, max); b = randInt(0, max);
    answer = a + b;
  } else if (op === "−") {
    a = randInt(0, max); b = randInt(0, a);
    answer = a - b;
  } else if (op === "×") {
    const mulMax = config.difficulty === 1 ? 10 : config.difficulty === 2 ? 12 : 15;
    a = randInt(0, mulMax); b = randInt(0, mulMax);
    answer = a * b;
  } else {
    const divMax = config.difficulty === 1 ? 10 : config.difficulty === 2 ? 12 : 15;
    b = randInt(1, divMax);
    const quotient = randInt(0, divMax);
    a = b * quotient;
    answer = quotient;
  }

  return { operand1: a, operand2: b, operator: op, correctAnswer: answer };
}

// ─── Display helpers ────────────────────────────────────
function showQuestion(teamIdx) {
  const q = teams[teamIdx].currentQuestion;
  $(`#question-${teamIdx + 1}`).textContent = `${q.operand1} ${q.operator} ${q.operand2} = ?`;
}

function updateAnswerDisplay(teamIdx) {
  $(`#answer-${teamIdx + 1}`).textContent = teams[teamIdx].answerBuffer || "\u00A0";
}

function updateScore(teamIdx) {
  const el = $(`#scene-score-${teamIdx + 1}`);
  el.textContent = teams[teamIdx].score;
  // Pop animation
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

// ─── Rope / squads position ─────────────────────────────
function updateRopePosition() {
  const diff = teams[0].score - teams[1].score;
  const maxShift = config.pointsToWin;
  // pct: -1 (red winning fully) to +1 (blue winning fully)
  const pct = Math.max(-1, Math.min(1, diff / maxShift));

  // Move the ENTIRE group (characters + rope + flag) as one unit.
  // When blue wins (pct > 0), the group shifts LEFT (blue pulls everything toward their side).
  // The center-line stays fixed, so the losing team crosses it visually.
  const tugGroup = $("#tug-group");
  const maxPixelShift = 120; // max pixels the group can move
  const shift = -pct * maxPixelShift;
  tugGroup.setAttribute("transform", `translate(${shift}, 0)`);
}

function effortPulse(teamIdx) {
  const tugGroup = $("#tug-group");
  const cls = teamIdx === 0 ? "effort-blue" : "effort-red";
  tugGroup.classList.add(cls);
  setTimeout(() => tugGroup.classList.remove(cls), 500);
}

// ─── Flash feedback ─────────────────────────────────────
function flashBox(teamIdx, correct) {
  const el = $(`#question-${teamIdx + 1}`);
  el.classList.remove("flash-correct", "flash-wrong");
  void el.offsetWidth;
  el.classList.add(correct ? "flash-correct" : "flash-wrong");
}

// ─── Submit answer ──────────────────────────────────────
function submitAnswer(teamIdx) {
  if (!gameRunning) return;
  const team = teams[teamIdx];
  const answer = parseInt(team.answerBuffer, 10);
  team.answerBuffer = "";
  updateAnswerDisplay(teamIdx);

  if (isNaN(answer)) return;

  team.attempted++;
  const correct = answer === team.currentQuestion.correctAnswer;

  if (correct) {
    team.score++;
    soundCorrect();
    flashBox(teamIdx, true);
    effortPulse(teamIdx);
  } else {
    soundWrong();
    flashBox(teamIdx, false);
  }

  updateScore(teamIdx);
  updateRopePosition();

  if (team.score >= config.pointsToWin) {
    endGame();
    return;
  }

  team.currentQuestion = generateQuestion();
  showQuestion(teamIdx);
}

// ─── Numpad handler ─────────────────────────────────────
function handleNumpad(teamIdx, digit) {
  if (!gameRunning) return;
  const team = teams[teamIdx];

  if (digit === "del") {
    team.answerBuffer = team.answerBuffer.slice(0, -1);
  } else if (digit === "ok") {
    submitAnswer(teamIdx);
    return;
  } else {
    if (team.answerBuffer.length < 6) {
      team.answerBuffer += digit;
    }
  }
  updateAnswerDisplay(teamIdx);
}

// ─── Timer ──────────────────────────────────────────────
function startTimer() {
  if (config.roundTimeSeconds === 0) {
    $("#timer-bar").style.width = "100%";
    $("#timer-text").textContent = "∞";
    return;
  }

  timeRemaining = config.roundTimeSeconds;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) endGame();
  }, 1000);
}

function updateTimerDisplay() {
  const pct = config.roundTimeSeconds > 0
    ? (timeRemaining / config.roundTimeSeconds) * 100
    : 100;
  $("#timer-bar").style.width = pct + "%";
  $("#timer-text").textContent = timeRemaining;
}

// ─── Start game ─────────────────────────────────────────
function startGame() {
  teams[0] = { score: 0, attempted: 0, currentQuestion: generateQuestion(), answerBuffer: "" };
  teams[1] = { score: 0, attempted: 0, currentQuestion: generateQuestion(), answerBuffer: "" };

  $("#scene-score-1").textContent = "0";
  $("#scene-score-2").textContent = "0";
  showQuestion(0);
  showQuestion(1);
  updateAnswerDisplay(0);
  updateAnswerDisplay(1);

  // Reset tug group to center
  $("#tug-group").setAttribute("transform", "translate(0, 0)");

  gameRunning = true;
  showScreen("#screen-game");
  startTimer();
}

// ─── End game ───────────────────────────────────────────
function endGame() {
  gameRunning = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

  const s0 = teams[0].score;
  const s1 = teams[1].score;
  const winnerIdx = s0 > s1 ? 0 : s1 > s0 ? 1 : -1;

  const resultCard = $(".result-card");
  const resultEl = $("#screen-result");
  resultEl.className = "screen";

  const titleEl = $("#result-title");
  if (winnerIdx === -1) {
    titleEl.textContent = t("draw");
    resultEl.classList.add("winner-draw");
  } else {
    const winnerName = t(winnerIdx === 0 ? "team1" : "team2");
    titleEl.textContent = `${t("resultTitleWin")} ${winnerName}`;
    resultEl.classList.add(winnerIdx === 0 ? "winner-blue" : "winner-red");
  }

  const opModeKey = {
    addition: "opAdd", subtraction: "opSub",
    multiplication: "opMul", division: "opDiv", mixed: "opMix"
  }[config.operationMode] || "opMix";

  const pct = (attempted, correct) =>
    attempted > 0 ? Math.round((correct / attempted) * 100) + "%" : "—";

  $("#result-summary").innerHTML = `
    <table style="margin:0 auto;text-align:left;border-collapse:collapse;">
      <tr><td></td>
          <td style="padding:6px 18px;font-weight:700;color:var(--blue)">${t("team1")}</td>
          <td style="padding:6px 18px;font-weight:700;color:var(--red)">${t("team2")}</td></tr>
      <tr><td style="padding:4px 10px;font-weight:600">${t("correct")}</td>
          <td style="text-align:center;font-size:1.2rem;font-weight:700">${s0}</td>
          <td style="text-align:center;font-size:1.2rem;font-weight:700">${s1}</td></tr>
      <tr><td style="padding:4px 10px;font-weight:600">${t("attempted")}</td>
          <td style="text-align:center">${teams[0].attempted}</td>
          <td style="text-align:center">${teams[1].attempted}</td></tr>
      <tr><td style="padding:4px 10px;font-weight:600">${t("accuracy")}</td>
          <td style="text-align:center">${pct(teams[0].attempted, s0)}</td>
          <td style="text-align:center">${pct(teams[1].attempted, s1)}</td></tr>
    </table>
    <p style="margin-top:14px"><strong>${t("level")}:</strong> ${config.difficulty} &nbsp;|&nbsp;
    <strong>${t("mode")}:</strong> ${t(opModeKey)}</p>
  `;

  showScreen("#screen-result");
}

// ─── Settings form ──────────────────────────────────────
function populateSettings() {
  $("#cfg-language").value   = config.language;
  $("#cfg-operation").value  = config.operationMode;
  $("#cfg-difficulty").value = config.difficulty;
  $("#cfg-time").value       = config.roundTimeSeconds;
  $("#cfg-points").value     = config.pointsToWin;
}

// ─── Init ───────────────────────────────────────────────
function init() {
  loadConfig();
  applyLanguage();
  populateSettings();

  // Language bar
  $$(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.lang);
      $("#cfg-language").value = config.language;
    });
  });

  // Sound toggle
  $("#sound-toggle").addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    $("#sound-toggle").classList.toggle("muted", !soundEnabled);
    $("#sound-toggle").innerHTML = soundEnabled ? "&#128264;" : "&#128263;";
  });

  // Start screen
  $("#btn-play").addEventListener("click", () => startGame());
  $("#btn-settings").addEventListener("click", () => { populateSettings(); showScreen("#screen-settings"); });

  // Settings
  $("#cfg-language").addEventListener("change", (e) => setLanguage(e.target.value));

  $("#btn-save-settings").addEventListener("click", () => {
    config.operationMode    = $("#cfg-operation").value;
    config.difficulty       = parseInt($("#cfg-difficulty").value, 10);
    config.roundTimeSeconds = parseInt($("#cfg-time").value, 10);
    config.pointsToWin      = parseInt($("#cfg-points").value, 10);
    saveConfig();
    showScreen("#screen-start");
  });

  $("#btn-back-start").addEventListener("click", () => showScreen("#screen-start"));

  // Numpads (touch/click)
  [0, 1].forEach(teamIdx => {
    $(`#numpad-${teamIdx + 1}`).addEventListener("click", (e) => {
      const btn = e.target.closest(".num-btn");
      if (!btn) return;
      handleNumpad(teamIdx, btn.dataset.digit);
    });
  });

  // Keyboard: top-row digits → Team 1, numpad → Team 2
  document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;

    if (e.code.startsWith("Digit")) {
      handleNumpad(0, e.code.replace("Digit", ""));
      e.preventDefault();
    } else if (e.code === "Backspace") {
      handleNumpad(0, "del");
      e.preventDefault();
    } else if (e.code === "Enter") {
      handleNumpad(0, "ok");
      e.preventDefault();
    }

    if (e.code.startsWith("Numpad") && e.code !== "NumpadEnter") {
      const d = e.code.replace("Numpad", "");
      if (/^\d$/.test(d)) { handleNumpad(1, d); e.preventDefault(); }
    } else if (e.code === "NumpadEnter") {
      handleNumpad(1, "ok");
      e.preventDefault();
    } else if (e.code === "NumpadDecimal" || e.code === "Delete") {
      handleNumpad(1, "del");
      e.preventDefault();
    }
  });

  // Result screen
  $("#btn-play-again").addEventListener("click", () => startGame());
  $("#btn-result-settings").addEventListener("click", () => { populateSettings(); showScreen("#screen-settings"); });
  $("#btn-result-home").addEventListener("click", () => showScreen("#screen-start"));

  // About modal
  initAboutModal();
}

// ─── About modal ─────────────────────────────────────────
function initAboutModal() {
  const overlay  = $("#modal-about");
  const btnAbout = $("#btn-about");
  const btnClose = $("#modal-close");
  if (!overlay || !btnAbout) return;

  function openModal() {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    btnClose.focus();
  }
  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    btnAbout.focus();
  }

  btnAbout.addEventListener("click", openModal);
  btnClose.addEventListener("click", closeModal);

  // Fecha ao clicar fora do card
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // Fecha com Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeModal();
  });
}

document.addEventListener("DOMContentLoaded", init);
