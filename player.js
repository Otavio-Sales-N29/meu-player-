// player.js — VERSÃO CORRIGIDA E OTIMIZADA
// Total compatibilidade com playlists originais + playlists criadas pelo usuário

// ELEMENTOS DO PLAYER
const songName = document.getElementById('song-name');
const bandName = document.getElementById('band-name');
const song = document.getElementById('audio');
const cover = document.getElementById('cover');
const play = document.getElementById('play');
const next = document.getElementById('next');
const previous = document.getElementById('previous');
const likeButton = document.getElementById('like');
const currentProgress = document.getElementById('current-progress');
const progressContainer = document.getElementById('progress-container');
const shuffleButton = document.getElementById('shuffle');
const repeatButton = document.getElementById('repeat');
const songTime = document.getElementById('song-time');
const totalTime = document.getElementById('total-time');
const back5Sec = document.getElementById('back-5-seconds');
const skip5Sec = document.getElementById('skip-5-seconds');
const progressBar = document.getElementById('progress-bar');
const reproducoes = document.getElementById('reproducoes');

// MINI PLAYER
const miniPlay = document.getElementById('mini-play');
const miniPrev = document.getElementById('mini-previous');
const miniNext = document.getElementById('mini-next');
const miniCurrentProgress = document.querySelector('.mini-current-progress');
const miniCurrentTime = document.querySelector('.mini-current-time');
const miniTotalTime = document.querySelector('.mini-total-time');
const miniProgressContainer = document.getElementById('mini-progress-container');

// BOTÃO VOLTAR
const voltarParaCapa =
  document.getElementById('voltar-para-capa') ||
  document.getElementById('voltar-para-capa-2');

if (voltarParaCapa) {
  voltarParaCapa.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

// AJUSTE DE LARGURA
function ajustarLargura() {
  if (!progressBar || !reproducoes) return;
  reproducoes.style.width = `${progressBar.offsetWidth}px`;
}

// PLAYLIST ORIGINAL
const originalPlaylist = JSON.parse(localStorage.getItem('playlist')) ?? [
  { songName: 'CANHOTOSxDESTROS', artist: 'FutParódias', file: 'CANHOTOSxDESTROS', liked: false },
  { songName: 'Gols acrobáticos', artist: 'FutParódias', file: 'SódeGolaçoAcrobático', liked: false },
  { songName: 'Bate de Trivela', artist: 'FutParódias', file: 'BATE_DE_TRIVELA', liked: false },
  { songName: 'Fazer Gol é Bom Demais', artist: 'FutParódias', file: 'FazerGolBomDemais', liked: false },
  { songName: 'Desfile de moda é na passarela', artist: 'FutParódias', file: 'FeioeFera', liked: false },
  { songName: 'GIGANTES vs BAIXINHOS', artist: 'FutParódias', file: 'GIGANTES_vs_BAIXINHOS', liked: false },
  { songName: 'Palmeiras x Peñarol na Libertadores', artist: 'FutParódias', file: 'PalmeirasxPeñarol', liked: false }
];

// VERIFICA PLAYLIST DO USUÁRIO
function getUserPlaylist() {
  try {
    const data = localStorage.getItem('user_playlist');
    if (!data) return null;

    const playlist = JSON.parse(data);
    return Array.isArray(playlist) && playlist.length ? playlist : null;
  } catch {
    return null;
  }
}

// Define playlist ativa
const source = localStorage.getItem('playlist_source') || 'original';
let sortedPlaylist =
  source === 'user' && getUserPlaylist() ? getUserPlaylist() : [...originalPlaylist];

let index = 0;
let isPlaying = false;
let isShuffled = false;
let repeatOn = false;

/* ============================================================
      🔥 FUNÇÃO NOVA — LIKES PRIMEIRO
   ============================================================ */
function ordenarPorLike() {
  sortedPlaylist.sort((a, b) => {
    if (a.liked === b.liked) return 0;
    return a.liked ? -1 : 1; // curtidas primeiro
  });
}
/* ============================================================ */

// FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO DA MÚSICA
function initializeSong() {
  const current = sortedPlaylist[index];
  if (!current) return;

  // MUSICA
  if (current.src) {
    song.src = current.src; // Base64
  } else {
    song.src = `songs/${current.file}.mp3`;
  }

  // IMAGEM / CAPA
  if (current.img) {
    cover.src = current.img;
  } else {
    const userImage = `nimages/${current.file}.jpg`;
    const originalImage = `images/${current.file}.jpg`;

    fetch(userImage)
      .then(r => {
        cover.src = r.ok ? userImage : originalImage;
      })
      .catch(() => {
        cover.src = originalImage;
      });
  }

  // TEXTOS
  songName.innerText = current.songName || current.file;
  bandName.innerText = current.artist || "Desconhecido";

  document.getElementById('song-name-da-lista').innerText = current.songName;
  document.getElementById('band-name-da-lista').innerText = current.artist;

  miniCurrentProgress.style.width = "0%";
  miniCurrentTime.innerText = "00:00";
  miniTotalTime.innerText = "00:00";

  likeButtonRender();

  cover.onload = () => {
    try {
      const colorThief = new ColorThief();
      const pal = colorThief.getPalette(cover, 2);
      document.body.style.background = `linear-gradient(to bottom, rgb(${pal[0]}), rgb(${pal[1]}))`;
    } catch { }
  };
}

// PLAY / PAUSE
function playSong() {
  play.querySelector('.bi').classList.replace('bi-play-circle-fill', 'bi-pause-circle-fill');
  miniPlay.querySelector('.bi').classList.replace('bi-play-circle-fill', 'bi-pause-circle-fill');
  song.play();
  isPlaying = true;
}
function pauseSong() {
  play.querySelector('.bi').classList.replace('bi-pause-circle-fill', 'bi-play-circle-fill');
  miniPlay.querySelector('.bi').classList.replace('bi-pause-circle-fill', 'bi-play-circle-fill');
  song.pause();
  isPlaying = false;
}
function playPause() {
  isPlaying ? pauseSong() : playSong();
}

// LIKE SYSTEM
function likeButtonRender() {
  const current = sortedPlaylist[index];
  if (!current) return;

  if (current.liked) {
    likeButton.querySelector('.bi').classList.replace('bi-heart', 'bi-heart-fill');
    likeButton.classList.add('button-active');
  } else {
    likeButton.querySelector('.bi').classList.replace('bi-heart-fill', 'bi-heart');
    likeButton.classList.remove('button-active');
  }
}

function toggleLike() {
  const current = sortedPlaylist[index];
  current.liked = !current.liked;
  likeButtonRender();

  if (source === 'user') {
    localStorage.setItem('user_playlist', JSON.stringify(sortedPlaylist));
  } else {
    const pos = originalPlaylist.findIndex(x => x.file === current.file);
    if (pos !== -1) originalPlaylist[pos].liked = current.liked;
    localStorage.setItem('playlist', JSON.stringify(originalPlaylist));
  }

  // 🔥 NOVO — reordena por likes
  ordenarPorLike();

  // 🔥 Ajusta índice para música atual
  index = sortedPlaylist.findIndex(x => x.file === current.file);
}

// PROGRESSO
function updateProgress() {
  if (!song.duration) return;
  const percent = (song.currentTime / song.duration) * 100;

  currentProgress.style.setProperty("--progress", `${percent}%`);
  miniCurrentProgress.style.width = `${percent}%`;

  songTime.innerText = formatTime(song.currentTime);
  miniCurrentTime.innerText = formatTime(song.currentTime).slice(3);
}
function jumpTo(e) {
  const width = progressContainer.clientWidth;
  const click = e.offsetX;
  song.currentTime = (click / width) * song.duration;
}

// FUNÇÕES AUXILIARES
function formatTime(sec) {
  if (!sec) return "00:00:00";
  const h = Math.floor(sec / 3600).toString().padStart(2, '0');
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// PROXIMA / ANTERIOR
function nextSong() {
  index = index === sortedPlaylist.length - 1 ? 0 : index + 1;
  initializeSong();
  playSong();
}
function previousSong() {
  index = index === 0 ? sortedPlaylist.length - 1 : index - 1;
  initializeSong();
  playSong();
}

// SHUFFLE
function shufflePlaylist() {
  if (!isShuffled) {
    sortedPlaylist.sort(() => 0.5 - Math.random());
    isShuffled = true;
    shuffleButton.classList.add("button-active");
  } else {
    sortedPlaylist =
      source === 'user' && getUserPlaylist()
        ? getUserPlaylist()
        : [...originalPlaylist];

    // 🔥 mantém likes primeiro ao desligar shuffle
    ordenarPorLike();

    isShuffled = false;
    shuffleButton.classList.remove("button-active");
  }
  index = 0;
  initializeSong();
}

// REPEAT
function repeatToggle() {
  repeatOn = !repeatOn;
  repeatButton.classList.toggle('button-active');
}
function nextOrRepeat() {
  repeatOn ? playSong() : nextSong();
}

// 5 SEGUNDOS
function back5seconds() { song.currentTime = Math.max(0, song.currentTime - 5); }
function skip5seconds() { song.currentTime = Math.min(song.duration, song.currentTime + 5); }

// EVENTOS
play.addEventListener('click', playPause);
miniPlay.addEventListener('click', playPause);

next.addEventListener('click', nextSong);
miniNext.addEventListener('click', nextSong);

previous.addEventListener('click', previousSong);
miniPrev.addEventListener('click', previousSong);

shuffleButton.addEventListener('click', shufflePlaylist);
repeatButton.addEventListener('click', repeatToggle);

likeButton.addEventListener('click', toggleLike);

back5Sec.addEventListener('click', back5seconds);
skip5Sec.addEventListener('click', skip5seconds);

progressContainer.addEventListener('click', jumpTo);
miniProgressContainer.addEventListener('click', jumpTo);

song.addEventListener('timeupdate', updateProgress);
song.addEventListener('ended', nextOrRepeat);

song.addEventListener('loadedmetadata', () => {
  totalTime.innerText = formatTime(song.duration);
  miniTotalTime.innerText = formatTime(song.duration).slice(3);
});

// INICIALIZA
window.addEventListener('load', () => {
  ordenarPorLike(); // 🔥 LIKES PRIMEIRO NO CARREGAR
  initializeSong();
  ajustarLargura();
});
window.addEventListener('resize', ajustarLargura);
