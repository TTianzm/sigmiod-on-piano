// 🎵 音符数组（带黑白键）
const whiteNotes = ['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5'];
const blackNotes = ['C#3','D#3','F#3','G#3','A#3','C#4','D#4','F#4','G#4','A#4'];

// 键盘绑定（选部分键位示例）
const noteKeys = {
  'z':'C3', 'x':'D3', 'c':'E3', 'v':'F3', 'b':'G3', 'n':'A3', 'm':'B3',
  'a':'C4', 's':'D4', 'd':'E4', 'f':'F4', 'g':'G4', 'h':'A4', 'j':'B4',
  'q':'C5'
};

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
function sigmoidRange(x, min, max) {
  return min + sigmoid(x) * (max - min);
}

let sigmoidPower = 1;

const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' }
});
const filter = new Tone.Filter(sigmoidRange(sigmoidPower, 300, 2000), "lowpass");
synth.connect(filter);

const analyser = new Tone.Analyser("waveform", 256);
filter.connect(analyser);
analyser.toDestination();

// 🎹 渲染键盘
const keyboard = document.getElementById('keyboard');
const noteDisplay = document.getElementById('noteDisplay');

whiteNotes.forEach(note => {
  const key = document.createElement('div');
  key.className = 'key white';
  key.dataset.note = note;
  key.innerText = note;
  keyboard.appendChild(key);
});

blackNotes.forEach(note => {
  const key = document.createElement('div');
  key.className = 'key black';
  key.dataset.note = note;
  key.style.position = 'absolute';
  key.style.marginLeft = getBlackKeyOffset(note);
  keyboard.appendChild(key);
});

// 黑键定位（粗略手动定位）
function getBlackKeyOffset(note) {
  const map = {
    'C#3': '30px', 'D#3': '70px', 'F#3': '150px', 'G#3': '190px', 'A#3': '230px',
    'C#4': '310px', 'D#4': '350px', 'F#4': '430px', 'G#4': '470px', 'A#4': '510px'
  };
  return map[note] || '0px';
}

document.querySelectorAll('.key').forEach(key => {
  key.addEventListener('mousedown', () => playNote(key.dataset.note));
});

function playNote(note) {
  Tone.start();
  const now = Tone.now();
  synth.set({
    envelope: {
      attack: sigmoidRange(sigmoidPower, 0.01, 0.3),
      decay: sigmoidRange(sigmoidPower, 0.1, 0.4),
      sustain: sigmoidRange(sigmoidPower, 0.3, 0.9),
      release: sigmoidRange(sigmoidPower, 0.1, 1.5)
    }
  });
  filter.frequency.value = sigmoidRange(sigmoidPower, 300, 3000);
  synth.triggerAttackRelease(note, "8n", now);
  noteDisplay.textContent = `${note} (${Tone.Frequency(note).toFrequency().toFixed(2)} Hz)`;
}

// ✅ 键盘控制
document.addEventListener("keydown", e => {
  const note = noteKeys[e.key];
  if (note) {
    playNote(note);
    const key = [...document.querySelectorAll(".key")].find(k => k.dataset.note === note);
    if (key) key.classList.add("active");
  }
});
document.addEventListener("keyup", e => {
  const note = noteKeys[e.key];
  if (note) {
    const key = [...document.querySelectorAll(".key")].find(k => k.dataset.note === note);
    if (key) key.classList.remove("active");
  }
});

// ✅ Sigmoid 控制滑块
document.getElementById("sigmoidSlider").addEventListener("input", e => {
  sigmoidPower = parseFloat(e.target.value);
  document.getElementById("sliderValue").textContent = sigmoidPower.toFixed(1);
});

// ✅ 波形可视化
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
function drawWaveform() {
  requestAnimationFrame(drawWaveform);
  const values = analyser.getValue();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = (i / values.length) * canvas.width;
    const y = (0.5 - v / 2) * canvas.height;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#0077cc";
  ctx.stroke();
}
drawWaveform();
