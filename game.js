const screens = {
  intro: document.getElementById("intro"),
  game: document.getElementById("game"),
  result: document.getElementById("result"),
  voucher: document.getElementById("voucher")
};

const startButton = document.getElementById("start-button");
const revealButton = document.getElementById("reveal-button");
const againButton = document.getElementById("again-button");
const playArea = document.getElementById("play-area");
const scoreNode = document.getElementById("score");
const timeNode = document.getElementById("time");
const progressFill = document.getElementById("progress-fill");
const gameHint = document.getElementById("game-hint");
const resultTitle = document.getElementById("result-title");
const resultCopy = document.getElementById("result-copy");
const resultEyebrow = document.getElementById("result-eyebrow");

const TARGET_SCORE = 15;
const GAME_SECONDS = 20;
let score = 0;
let timeLeft = GAME_SECONDS;
let timerId = null;
let spawnId = null;
let playing = false;
let heartId = 0;

function showScreen(name) {
  Object.entries(screens).forEach(([key, node]) => {
    const isActive = key === name;
    node.hidden = !isActive;
    node.classList.toggle("active", isActive);
  });
}

function updateScore() {
  scoreNode.textContent = String(score).padStart(2, "0");
  progressFill.style.width = `${Math.min(100, (score / TARGET_SCORE) * 100)}%`;
}

function clearGame() {
  clearInterval(timerId);
  clearInterval(spawnId);
  timerId = null;
  spawnId = null;
  playing = false;
  playArea.querySelectorAll(".target-heart, .float-score").forEach((node) => node.remove());
}

function startGame() {
  clearGame();
  score = 0;
  timeLeft = GAME_SECONDS;
  heartId = 0;
  updateScore();
  timeNode.textContent = timeLeft;
  gameHint.hidden = false;
  showScreen("game");
  playing = true;

  spawnHeart();
  spawnHeart();
  spawnId = setInterval(spawnHeart, 620);

  timerId = setInterval(() => {
    timeLeft -= 1;
    timeNode.textContent = timeLeft;
    if (timeLeft <= 0) finishGame(false);
  }, 1000);
}

function spawnHeart() {
  if (!playing) return;
  const existing = playArea.querySelectorAll(".target-heart");
  if (existing.length >= 5) existing[0].remove();

  const heart = document.createElement("button");
  const isGold = Math.random() < 0.14;
  heart.type = "button";
  heart.className = `target-heart${isGold ? " gold" : ""}`;
  heart.setAttribute("aria-label", isGold ? "Goldenes Herz, drei Punkte" : "Herz, ein Punkt");
  heart.textContent = isGold ? "🙉" : (Math.random() < 0.5 ? "🐵" : "🐒");
  const maxX = Math.max(0, playArea.clientWidth - 58);
  const maxY = Math.max(0, playArea.clientHeight - 64);
  heart.style.left = `${8 + Math.random() * Math.max(0, maxX - 16)}px`;
  heart.style.top = `${8 + Math.random() * Math.max(0, maxY - 16)}px`;
  heart.dataset.points = isGold ? "3" : "1";
  heart.dataset.id = String(++heartId);

  heart.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (!playing || !heart.isConnected) return;
    const points = Number(heart.dataset.points);
    score += points;
    updateScore();
    const float = document.createElement("span");
    float.className = "float-score";
    float.textContent = `+${points}`;
    float.style.left = heart.style.left;
    float.style.top = heart.style.top;
    playArea.appendChild(float);
    heart.remove();
    window.setTimeout(() => float.remove(), 650);
    if (score >= TARGET_SCORE) finishGame(true);
  }, { once: true });

  playArea.appendChild(heart);
  gameHint.hidden = true;
  window.setTimeout(() => {
    if (heart.isConnected) heart.remove();
  }, 1850);
}

function finishGame(won) {
  if (!playing) return;
  clearGame();
  if (won) {
    resultEyebrow.textContent = "КСЮША!";
    resultTitle.textContent = "Поздравляю!";
    resultCopy.textContent = "Ты словила всех обезьян! Молодец! Тебя ждет подарок!";
    revealButton.textContent = "Открыть сюрприз ↗";
    revealButton.onclick = () => showScreen("voucher");
  } else {
    resultEyebrow.textContent = "Ксюш давай еще одну попытку!";
    resultTitle.textContent = "Почти!";
    resultCopy.textContent = `Ты словила ${score} из ${TARGET_SCORE} обезьян. Ничего страшного! Попробуй еще раз😌`;
    revealButton.textContent = "Еще одна попытка ↻";
    revealButton.onclick = startGame;
  }
  showScreen("result");
}

startButton.addEventListener("click", startGame);
revealButton.addEventListener("click", () => showScreen("voucher"));
againButton.addEventListener("click", () => showScreen("intro"));

document.addEventListener("visibilitychange", () => {
  if (document.hidden && playing) {
    clearGame();
    showScreen("intro");
  }
});
const photoModal = document.getElementById("photoModal");
const openPhotoModal = document.getElementById("openPhotoModal");
const closePhotoModal = document.getElementById("closePhotoModal");
const closePhotoButton = document.getElementById("closePhotoButton");

function openModal() {
  photoModal.classList.add("is-open");
  photoModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  closePhotoButton.focus();
}

function closeModal() {
  photoModal.classList.remove("is-open");
  photoModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  openPhotoModal.focus();
}

openPhotoModal.addEventListener("click", openModal);
closePhotoModal.addEventListener("click", closeModal);
closePhotoButton.addEventListener("click", closeModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && photoModal.classList.contains("is-open")) {
    closeModal();
  }
});