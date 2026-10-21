
"use strict";

const $ = (selector) => document.querySelector(selector);

const canvas = $("#universe");
const ctx = canvas.getContext("2d");

const stars = [];
const STAR_COUNT = 220;

let width = 0;
let height = 0;
let animationFrame = 0;
let lastFrame = 0;
let letterOpened = false;
let typingTimer = null;
let audioContext = null;
let musicPlaying = false;
let musicTimer = null;
let toastTimer = null;

const message = `Аида, знаешь, иногда самые красивые вещи невозможно объяснить словами.

Я хотел создать для тебя что-то особенное. Не просто открытку, а маленькую вселенную, в которой каждая звезда напоминает о том, как много может значить один человек.

Космос бесконечен, звёзд миллиарды, но у каждого есть что-то, что выделяется среди всего остального. И именно поэтому эта страница посвящена тебе.

Пусть в твоей жизни будет больше улыбок, тёплых моментов, искренних людей и причин радоваться каждому новому дню.

Когда ты смотришь на ночное небо, помни: даже самая далёкая звезда может подарить кому-то немного света.

Эта маленькая вселенная создана специально для тебя. 💜`;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// ------------------------------
// ЗВЁЗДНОЕ НЕБО
// ------------------------------

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  createStars();
}

function createStars() {
  stars.length = 0;

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.2,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.018 + 0.003,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.82
        ? "#d9c6ff"
        : Math.random() > 0.5
          ? "#ffffff"
          : "#a8dfff"
    });
  }
}

function drawStars(time) {
  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    const twinkle = reducedMotion
      ? 0.8
      : 0.55 + Math.sin(time * star.speed + star.phase) * 0.4;

    ctx.globalAlpha = star.alpha * twinkle;
    ctx.fillStyle = star.color;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();

    if (star.radius > 1.25) {
      ctx.globalAlpha = star.alpha * twinkle * 0.3;
      ctx.fillRect(star.x - 4, star.y - 0.35, 8, 0.7);
      ctx.fillRect(star.x - 0.35, star.y - 4, 0.7, 8);
    }
  }

  ctx.globalAlpha = 1;
}

function animate(time) {
  if (time - lastFrame > 25 || !lastFrame) {
    drawStars(time);
    lastFrame = time;
  }

  animationFrame = requestAnimationFrame(animate);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animationFrame = requestAnimationFrame(animate);

// ------------------------------
// ПЛАВАЮЩИЕ СЕРДЦА
// ------------------------------

const heartLayer = $("#floating-hearts");

function createHeart(options = {}) {
  const heart = document.createElement("span");

  heart.className = "floating-heart";
  heart.textContent = options.symbol || (
    Math.random() > 0.25 ? "♥" : "✦"
  );

  const x = options.x ?? Math.random() * 100;
  const size = options.size ?? (12 + Math.random() * 25);
  const duration = options.duration ?? (5 + Math.random() * 5);
  const hue = options.hue ?? (285 + Math.random() * 65);
  const drift = (Math.random() - 0.5) * 180;

  heart.style.left = `${x}%`;
  heart.style.fontSize = `${size}px`;
  heart.style.color = `hsl(${hue}, 100%, 80%)`;
  heart.style.animationDuration = `${duration}s`;
  heart.style.setProperty("--drift", `${drift}px`);

  heartLayer.appendChild(heart);

  heart.addEventListener("animationend", () => heart.remove(), {
    once: true
  });
}

if (!reducedMotion) {
  const heartInterval = window.setInterval(() => {
    if (document.hidden) return;
    createHeart();
  }, 850);

  window.addEventListener("pagehide", () => {
    clearInterval(heartInterval);
  }, { once: true });
}

// ------------------------------
// ЭФФЕКТ МОЛНИИ
// ------------------------------

const lightning = $("#lightning");

function lightningFlash() {
  if (reducedMotion || document.hidden) return;

  lightning.classList.remove("flash");

  // Перезапускаем CSS-анимацию.
  void lightning.offsetWidth;

  lightning.classList.add("flash");
}

if (!reducedMotion) {
  const lightningInterval = window.setInterval(() => {
    if (Math.random() < 0.32) {
      lightningFlash();
    }
  }, 9000);

  window.addEventListener("pagehide", () => {
    clearInterval(lightningInterval);
  }, { once: true });
}

// ------------------------------
// УВЕДОМЛЕНИЯ
// ------------------------------

function showToast(text) {
  const toast = $("#toast");

  toast.textContent = text;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// ------------------------------
// ОТКРЫТИЕ РОМАНТИЧЕСКОГО ПИСЬМА
// ------------------------------

const letterSection = $("#letter-section");
const letterMessage = $("#letter-message");
const openLetterButton = $("#open-letter");
const closeLetterButton = $("#close-letter");

function typeMessage() {
  clearTimeout(typingTimer);

  letterMessage.textContent = "";

  if (reducedMotion) {
    letterMessage.textContent = message;
    return;
  }

  let index = 0;
  const speed = 24;

  function typeNext() {
    if (!letterOpened) return;

    letterMessage.textContent = message.slice(0, index);
    index++;

    if (index <= message.length) {
      typingTimer = window.setTimeout(typeNext, speed);
    }
  }

  typeNext();
}

function openLetter() {
  if (letterOpened) {
    letterSection.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "center"
    });
    return;
  }

  letterOpened = true;

  letterSection.classList.add("visible");
  letterSection.setAttribute("aria-hidden", "false");
  openLetterButton.setAttribute("aria-expanded", "true");

  typeMessage();

  // Небольшой праздничный эффект.
  for (let i = 0; i < 30; i++) {
    window.setTimeout(() => {
      createHeart({
        x: 15 + Math.random() * 70,
        size: 12 + Math.random() * 22,
        duration: 3 + Math.random() * 3,
        hue: 280 + Math.random() * 75
      });
    }, i * 65);
  }

  window.setTimeout(() => {
    letterSection.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }, 120);
}

function closeLetter() {
  letterOpened = false;

  clearTimeout(typingTimer);

  letterSection.classList.remove("visible");
  letterSection.setAttribute("aria-hidden", "true");
  openLetterButton.setAttribute("aria-expanded", "false");

  window.scrollTo({
    top: 0,
    behavior: reducedMotion ? "auto" : "smooth"
  });
}

openLetterButton.addEventListener("click", openLetter);
closeLetterButton.addEventListener("click", closeLetter);

// ------------------------------
// ПРАЗДНИК СЕРДЕЦ
// ------------------------------

$("#heart-button").addEventListener("click", () => {
  for (let i = 0; i < 65; i++) {
    window.setTimeout(() => {
      createHeart({
        x: 5 + Math.random() * 90,
        size: 14 + Math.random() * 26,
        duration: 3 + Math.random() * 4,
        hue: 290 + Math.random() * 65,
        symbol: Math.random() > 0.2 ? "♥" : "✧"
      });
    }, i * 35);
  }

  lightningFlash();
  showToast("Маленькая вселенная посылает тебе любовь 💜");
});

// ------------------------------
// КОСМИЧЕСКАЯ МУЗЫКА
// ------------------------------

// Звук создаётся Web Audio API.
// Никакие музыкальные файлы скачивать не нужно.

let masterGain = null;
let musicNodes = [];
let musicStep = 0;

const melody = [
  261.63, 329.63, 392.00, 329.63,
  293.66, 349.23, 440.00, 349.23,
  261.63, 329.63, 392.00, 523.25,
  440.00, 392.00, 329.63, 293.66
];

function playNote(frequency, startTime, duration) {
  if (!audioContext || !masterGain) return;

  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();
  const shimmer = audioContext.createOscillator();
  const shimmerGain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);

  shimmer.type = "triangle";
  shimmer.frequency.setValueAtTime(frequency * 2.005, startTime);

  volume.gain.setValueAtTime(0.0001, startTime);
  volume.gain.exponentialRampToValueAtTime(0.055, startTime + 0.08);
  volume.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + duration
  );

  shimmerGain.gain.setValueAtTime(0.0001, startTime);
  shimmerGain.gain.linearRampToValueAtTime(0.008, startTime + 0.1);
  shimmerGain.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + duration
  );

  oscillator.connect(volume);
  volume.connect(masterGain);

  shimmer.connect(shimmerGain);
  shimmerGain.connect(masterGain);

  oscillator.start(startTime);
  shimmer.start(startTime);

  oscillator.stop(startTime + duration + 0.05);
  shimmer.stop(startTime + duration + 0.05);

  musicNodes.push(oscillator, shimmer, volume, shimmerGain);
}

function scheduleMusic() {
  if (!musicPlaying || !audioContext) return;

  const now = audioContext.currentTime;

  // Небольшая последовательность нот с мягкими паузами.
  for (let i = 0; i < 4; i++) {
    const noteIndex = musicStep % melody.length;
    const frequency = melody[noteIndex];
    const start = now + i * 0.48;

    playNote(frequency, start, 0.85);

    if (i === 0 || i === 2) {
      playNote(frequency / 2, start, 1.05);
    }

    musicStep++;
  }
}

async function startMusic() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    showToast("Твой браузер не поддерживает Web Audio API.");
    return;
  }

  try {
    if (!audioContext) {
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(audioContext.destination);
    }

    await audioContext.resume();

    musicPlaying = true;

    $("#music-icon").textContent = "♫";
    $("#music-text").textContent = "Выключить музыку";

    scheduleMusic();

    musicTimer = window.setInterval(() => {
      scheduleMusic();
    }, 1920);

    showToast("Космическая мелодия включена ✨");
  } catch (error) {
    console.error("Не удалось включить музыку:", error);
    showToast("Не удалось включить звук. Попробуй ещё раз.");
    musicPlaying = false;
  }
}

function stopMusic() {
  musicPlaying = false;

  clearInterval(musicTimer);

  if (masterGain && audioContext) {
    masterGain.gain.cancelScheduledValues(audioContext.currentTime);
    masterGain.gain.setTargetAtTime(
      0,
      audioContext.currentTime,
      0.04
    );
  }

  // Останавливаем текущие ноты и отключаем их.
  for (const node of musicNodes) {
    try {
      if (typeof node.stop === "function") {
        node.stop();
      }
      node.disconnect();
    } catch {
      // Узел мог завершиться самостоятельно.
    }
  }

  musicNodes = [];

  if (masterGain) {
    masterGain.gain.value = 0.7;
  }

  $("#music-icon").textContent = "♫";
  $("#music-text").textContent = "Включить музыку";
}

$("#music-button").addEventListener("click", () => {
  if (musicPlaying) {
    stopMusic();
    showToast("Музыка выключена");
  } else {
    startMusic();
  }
});

// ------------------------------
// КЛАВИАТУРА
// ------------------------------

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && letterOpened) {
    closeLetter();
  }
});

// ------------------------------
// ЗАЩИТА ОТ ЛИШНЕЙ РАБОТЫ В ФОНЕ
// ------------------------------

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
  } else {
    lastFrame = 0;
    animationFrame = requestAnimationFrame(animate);
  }
});

console.log(
  "%c COSMIC LOVE ",
  "background: #21133f; color: #f0c7ff; font-size: 20px; padding: 10px;"
);
console.log("Вселенная для Аиды загружена 💜");
