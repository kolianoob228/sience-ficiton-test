const questions = [
  {
    category: "LITTÉRATURE · ORIGINES",
    question: "En quelle année Mary Shelley a-t-elle publié son livre « Frankenstein » ?",
    answers: ["1818", "1926", "1902"], correct: 0,
    explanation: "Mary Shelley a publié Frankenstein, ou le Prométhée moderne en 1818. 1926 et 1902 ne sont pas l’année de parution du roman."
  },
  {
    category: "CINÉMA · LES PREMIÈRES ÉTOILES",
    question: "Quel est l’un des premiers grands films de science-fiction, réalisé en 1902 ?",
    answers: ["Avatar", "Star Wars", "Le Voyage dans la Lune"], correct: 2,
    explanation: "Georges Méliès a réalisé Le Voyage dans la Lune en 1902. Avatar et Star Wars sont des films beaucoup plus récents."
  },
  {
    category: "CINÉMA · MONDES LOINTAINS",
    question: "Dans quel film l’histoire se passe-t-elle sur la planète Pandora ?",
    answers: ["Star Wars", "Avatar", "Interstellar"], correct: 1,
    explanation: "Avatar de James Cameron se déroule sur Pandora, où vivent les Na’vi. Star Wars et Interstellar racontent des histoires dans d’autres univers."
  },
  {
    category: "CINÉMA · VOYAGE INTERSTELLAIRE",
    question: "Dans quel film un groupe de personnes part-il dans l’espace pour trouver une nouvelle planète ?",
    answers: ["Avatar", "Interstellar", "Star Wars"], correct: 1,
    explanation: "Dans Interstellar, une équipe part chercher un monde habitable pour l’humanité. Avatar et Star Wars n’ont pas cette mission au cœur de leur histoire."
  },
  {
    category: "CINÉMA · PREMIERS FILMS",
    question: "Quel est le premier long métrage réalisé par George Lucas ?",
    answers: ["Star Wars", "Interstellar", "THX 1138"], correct: 2,
    explanation: "THX 1138, sorti en 1971, est le premier long métrage réalisé par George Lucas. Star Wars est venu ensuite ; Interstellar a été réalisé par Christopher Nolan."
  },
  {
    category: "CINÉMA · GRANDS RÉALISATEURS",
    question: "Quelle est la nationalité de James Cameron ?",
    answers: ["Française", "Américaine", "Canadienne"], correct: 2,
    explanation: "James Cameron est canadien, né en Ontario. Il n’est ni français ni américain."
  },
  {
    category: "SOUS-GENRES · FUTURS URBAINS",
    question: "Dans une ville futuriste, des robots travaillent partout, mais deux entreprises privées contrôlent toute l’eau et l’électricité. Quel sous-genre correspond le mieux à cette histoire ?",
    answers: ["Le Space Opera", "La science-fiction post-apocalyptique", "Le Cyberpunk"], correct: 2,
    explanation: "Le cyberpunk associe souvent technologie omniprésente et entreprises puissantes en milieu urbain. Le space opera privilégie les aventures spatiales ; le post-apocalyptique imagine l’après-catastrophe."
  },
  {
    category: "IDÉES · SCIENCE ET SOCIÉTÉ",
    question: "Selon la conclusion du texte, quel est le principal intérêt de la science-fiction face aux nouvelles découvertes scientifiques ?",
    answers: ["Prédire exactement la date des futures catastrophes", "Réfléchir aux effets du progrès sur notre société", "Montrer que la technologie résout tous les problèmes humains"], labels: ["A", "B", "D"], correct: 1,
    explanation: "La science-fiction nous invite à réfléchir aux effets du progrès sur la société. Elle ne prédit pas la date des catastrophes et ne prétend pas que la technologie règle tout."
  }
];

const homeScreen = document.querySelector("#home");
const quizScreen = document.querySelector("#quiz");
const resultsScreen = document.querySelector("#results");
const questionCard = document.querySelector("#question-card");
const questionTitle = document.querySelector("#question-title");
const answersNode = document.querySelector("#answers");
const feedbackNode = document.querySelector("#feedback");
const progressFill = document.querySelector("#progress-fill");
const progressBar = document.querySelector(".progress-track[role='progressbar']");
const soundToggle = document.querySelector("#sound-toggle");
const musicToggle = document.querySelector("#music-toggle");
const musicLabel = document.querySelector("#music-label");
let currentQuestion = 0;
let score = 0;
let selections = [];
let soundEnabled = true;
let musicPreference = null;
let musicEnabled = false;
let audioContext = null;
let musicGain = null;
let musicDelay = null;
let melodyTimer = null;
let melodyIndex = 0;
let moveTimer = null;
let currentFact = 0;

const melodyNotes = [392, 587.33, 493.88, 659.25, 587.33, 493.88, 392, 0, 740, 659.25, 587.33, 493.88];

function prepareMusic() {
  if (audioContext) return true;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;

  audioContext = new AudioContextClass();
  musicGain = audioContext.createGain();
  musicGain.gain.value = 0;
  musicGain.connect(audioContext.destination);

  musicDelay = audioContext.createDelay(3);
  musicDelay.delayTime.value = .72;
  const delayFeedback = audioContext.createGain();
  const delayWet = audioContext.createGain();
  delayFeedback.gain.value = .22;
  delayWet.gain.value = .2;
  musicDelay.connect(delayFeedback);
  delayFeedback.connect(musicDelay);
  musicDelay.connect(delayWet);
  delayWet.connect(musicGain);

  // A quiet, low chord under the melody gives the notes a soft ambient bed.
  [[65.41, .022], [98, .012], [130.81, .006]].forEach(([frequency, volume]) => {
    const oscillator = audioContext.createOscillator();
    const voiceGain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    voiceGain.gain.value = volume;
    oscillator.connect(voiceGain);
    voiceGain.connect(musicGain);
    oscillator.start();
  });
  return true;
}

function playMelodyNote() {
  if (!musicEnabled || !audioContext) return;
  const frequency = melodyNotes[melodyIndex % melodyNotes.length];
  melodyIndex += 1;
  if (!frequency) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  const echoSend = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);
  envelope.gain.setValueAtTime(.0001, now);
  envelope.gain.exponentialRampToValueAtTime(.026, now + .65);
  envelope.gain.setTargetAtTime(.0001, now + 1.15, .8);
  echoSend.gain.value = .42;
  oscillator.connect(envelope);
  envelope.connect(musicGain);
  envelope.connect(echoSend);
  echoSend.connect(musicDelay);
  oscillator.start(now);
  oscillator.stop(now + 4.5);
  oscillator.addEventListener("ended", () => {
    oscillator.disconnect();
    envelope.disconnect();
    echoSend.disconnect();
  }, { once: true });
}

function setMusicEnabled(enabled) {
  musicPreference = enabled;
  musicEnabled = enabled;
  musicToggle.setAttribute("aria-pressed", String(enabled));
  musicToggle.setAttribute("aria-label", enabled ? "Désactiver la musique d’ambiance" : "Activer la musique d’ambiance");
  musicLabel.textContent = enabled ? "Musique · activée" : "Musique · désactivée";

  if (!enabled) {
    if (melodyTimer !== null) window.clearInterval(melodyTimer);
    melodyTimer = null;
    if (musicGain && audioContext) {
      musicGain.gain.cancelScheduledValues(audioContext.currentTime);
      musicGain.gain.setTargetAtTime(0, audioContext.currentTime, .22);
    }
    return;
  }

  if (!prepareMusic()) {
    musicLabel.textContent = "Audio indisponible";
    musicToggle.setAttribute("aria-label", "La musique d’ambiance n’est pas prise en charge par ce navigateur");
    musicToggle.setAttribute("aria-pressed", "false");
    musicEnabled = false;
    musicPreference = false;
    return;
  }
  audioContext.resume().then(() => {
    if (!musicEnabled) return;
    musicGain.gain.cancelScheduledValues(audioContext.currentTime);
    musicGain.gain.setTargetAtTime(.8, audioContext.currentTime, .9);
    if (melodyTimer === null) {
      playMelodyNote();
      melodyTimer = window.setInterval(playMelodyNote, 2750);
    }
  });
}

function showScreen(screen) {
  [homeScreen, quizScreen, resultsScreen].forEach((item) => item.classList.toggle("is-hidden", item !== screen));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function speak(text) {
  if (!soundEnabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = .92;
  window.speechSynthesis.speak(utterance);
}

function answerLabel(item, index) {
  return item.labels?.[index] ?? String.fromCharCode(65 + index);
}

function beginQuiz() {
  window.clearTimeout(moveTimer);
  window.speechSynthesis?.cancel();
  if (musicPreference === null) setMusicEnabled(true);
  currentQuestion = 0;
  score = 0;
  selections = [];
  showScreen(quizScreen);
  renderQuestion();
}

function renderQuestion() {
  const item = questions[currentQuestion];
  const number = String(currentQuestion + 1).padStart(2, "0");
  questionCard.className = `question-card theme-${currentQuestion}`;
  document.querySelector("#question-category").textContent = item.category;
  questionTitle.textContent = item.question;
  questionTitle.focus({ preventScroll: true });
  document.querySelector("#progress-label").textContent = `QUESTION ${number}`;
  document.querySelector("#progress-total").innerHTML = `${number} <i>/ ${String(questions.length).padStart(2, "0")}</i>`;
  document.querySelector("#question-index-number").textContent = number;
  progressFill.style.width = `${(currentQuestion / questions.length) * 100}%`;
  progressBar.setAttribute("aria-valuenow", String(currentQuestion));
  feedbackNode.hidden = true;
  feedbackNode.textContent = "";
  feedbackNode.className = "feedback";
  answersNode.replaceChildren();
  item.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.dataset.answer = String(index);
    button.innerHTML = `<span class="answer-letter">${answerLabel(item, index)}</span><span>${answer}</span>`;
    button.addEventListener("click", () => selectAnswer(index));
    answersNode.append(button);
  });
}

function selectAnswer(index) {
  if (selections[currentQuestion] !== undefined) return;
  const item = questions[currentQuestion];
  const isCorrect = index === item.correct;
  selections[currentQuestion] = index;
  if (isCorrect) score += 1;

  [...answersNode.children].forEach((button, optionIndex) => {
    button.disabled = true;
    if (optionIndex === index) button.classList.add(isCorrect ? "is-correct" : "is-wrong");
    if (!isCorrect && optionIndex === item.correct) button.classList.add("reveal-correct");
  });

  feedbackNode.hidden = false;
  feedbackNode.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
  feedbackNode.textContent = isCorrect ? "✦  Bonne réponse !" : `✦  Pas tout à fait. La bonne réponse était ${answerLabel(item, item.correct)}.`;
  speak(isCorrect ? "Bonne réponse !" : "Mauvaise réponse.");
  moveTimer = window.setTimeout(() => {
    currentQuestion += 1;
    if (currentQuestion < questions.length) renderQuestion();
    else showResults();
  }, 1550);
}

function showResults() {
  window.speechSynthesis?.cancel();
  showScreen(resultsScreen);
  document.querySelector("#score").textContent = String(score);
  const captions = ["Un premier pas parmi les étoiles.", "Quelques belles découvertes en chemin.", "Une belle traversée des mondes imaginaires.", "Un vrai connaisseur des univers de SF."];
  const captionIndex = score < 3 ? 0 : score < 5 ? 1 : score < 7 ? 2 : 3;
  document.querySelector("#score-caption").textContent = captions[captionIndex];
  document.querySelector("#review-summary").textContent = `${score} bonne${score > 1 ? "s" : ""} réponse${score > 1 ? "s" : ""} sur ${questions.length}`;
  const reviewList = document.querySelector("#review-list");
  reviewList.replaceChildren();

  questions.forEach((item, index) => {
    const choiceIndex = selections[index];
    const isCorrect = choiceIndex === item.correct;
    const review = document.createElement("article");
    review.className = `review-item ${isCorrect ? "is-correct" : "is-incorrect"}`;
    const selectedLabel = choiceIndex === undefined ? "Aucune réponse" : `${answerLabel(item, choiceIndex)}) ${item.answers[choiceIndex]}`;
    const correctLabel = `${answerLabel(item, item.correct)}) ${item.answers[item.correct]}`;
    review.innerHTML = `<span class="review-number">${String(index + 1).padStart(2, "0")}</span><span class="review-status">${isCorrect ? "Réussi ✦" : "À revoir"}</span><h3 class="review-question"></h3><p class="review-choice"></p><p class="review-correct"></p><p class="review-explanation"><strong>Pourquoi&nbsp;?</strong> <span></span></p>`;
    review.querySelector(".review-question").textContent = item.question;
    review.querySelector(".review-choice").textContent = `Votre réponse : ${selectedLabel}`;
    review.querySelector(".review-correct").textContent = `Bonne réponse : ${correctLabel}`;
    review.querySelector(".review-explanation span").textContent = item.explanation;
    reviewList.append(review);
  });
}

function rotateFact() {
  const slides = [...document.querySelectorAll(".fact-slide")];
  slides[currentFact].classList.remove("is-current");
  currentFact = (currentFact + 1) % slides.length;
  slides[currentFact].classList.add("is-current");
  document.querySelector("#fact-counter").textContent = `${String(currentFact + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  document.querySelector("#fact-progress").style.transform = `translateX(${currentFact * 100}%)`;
}

document.querySelector("#start-button").addEventListener("click", beginQuiz);
document.querySelector("#restart-button").addEventListener("click", beginQuiz);
musicToggle.addEventListener("click", () => setMusicEnabled(!musicEnabled));
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.innerHTML = soundEnabled ? '<span aria-hidden="true">◖))</span> Voix activée' : '<span aria-hidden="true">◖))</span> Voix désactivée';
  if (!soundEnabled) window.speechSynthesis?.cancel();
});
window.setInterval(rotateFact, 8500);
