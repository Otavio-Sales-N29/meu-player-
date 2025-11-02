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

// === MINI PLAYER ===
const miniPlay = document.getElementById('mini-play');
const miniPrev = document.getElementById('mini-previous');
const miniNext = document.getElementById('mini-next');
const miniCurrentProgress = document.querySelector('.mini-current-progress');
const miniCurrentTime = document.querySelector('.mini-current-time');
const miniTotalTime = document.querySelector('.mini-total-time');
const miniProgressContainer = document.getElementById('mini-progress-container');

// === AJUSTE DE LARGURA ===
function ajustarLargura() {
  const largura = progressBar.offsetWidth;
  reproducoes.style.width = `${largura}px`;
}

// === PLAYLIST ===
const FazerGolBomDemais = { songName: 'Fazer Gol é Bom Demais', artist: 'FutParódias', file: 'FazerGolBomDemais', liked: false };
const FeioeFera = { songName: 'Desfile de moda é na passarela', artist: 'FutParódias', file: 'FeioeFera', liked: false };
const GIGANTESvsBAIXINHOS = { songName: 'GIGANTES vs BAIXINHOS', artist: 'FutParódias', file: 'GIGANTES vs BAIXINHOS', liked: false };
const palmeirasxPenarol = { songName: 'Palmeiras x Peñarol na Libertadores', artist: 'FutParódias', file: 'PalmeirasxPeñarol', liked: false };
const golAcrobatico = { songName: 'Gols acrobáticos', artist: 'FutParódias', file: 'SódeGolaçoAcrobático', liked: false };
const BatedeTrivela = { songName: 'Bate de Trivela', artist: 'FutParódias', file: 'BATE_DE_TRIVELA', liked: false };
const CANHOTOSxDESTROS = { songName: 'CANHOTOSxDESTROS', artist: 'FutParódias', file: 'CANHOTOSxDESTROS', liked: false };

let isPlaying = false;
let isShuffled = false;
let repeatOn = false;

const originalPlaylist = JSON.parse(localStorage.getItem('playlist')) ??
  [CANHOTOSxDESTROS, golAcrobatico, BatedeTrivela, FazerGolBomDemais, FeioeFera, GIGANTESvsBAIXINHOS, palmeirasxPenarol];
let sortedPlaylist = [...originalPlaylist];
let index = 0;

// === FUNÇÕES PRINCIPAIS ===
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

function playPauseDecider() {
  isPlaying ? pauseSong() : playSong();
}

function likeButtonRender() {
  if (sortedPlaylist[index].liked) {
    likeButton.querySelector('.bi').classList.replace('bi-heart', 'bi-heart-fill');
    likeButton.classList.add('button-active');
  } else {
    likeButton.querySelector('.bi').classList.replace('bi-heart-fill', 'bi-heart');
    likeButton.classList.remove('button-active');
  }
}

function initializeSong() {
  const current = sortedPlaylist[index];
  cover.src = `images/${current.file}.jpg`;
  song.src = `songs/${current.file}.mp3`;
  songName.innerText = current.songName;
  bandName.innerText = current.artist;
  document.getElementById('song-name-da-lista').innerText = current.songName;
  document.getElementById('band-name-da-lista').innerText = current.artist;

  miniCurrentTime.innerText = "00:00";
  miniTotalTime.innerText = "00:00";
  likeButtonRender();

  cover.onload = () => {
    const colorThief = new ColorThief();
    const palette = colorThief.getPalette(cover, 2);
    document.body.style.background = `linear-gradient(to bottom, rgb(${palette[0]}), rgb(${palette[1]}))`;
  };
}

function previousSong() {
  index = index === 0 ? sortedPlaylist.length - 1 : index - 1;
  initializeSong();
  playSong();
}

function nextSong() {
  index = index === sortedPlaylist.length - 1 ? 0 : index + 1;
  initializeSong();
  playSong();
}

function updateProgress() {
  const percent = (song.currentTime / song.duration) * 100;
  currentProgress.style.setProperty('--progress', `${percent}%`);
  miniCurrentProgress.style.width = `${percent}%`;
  songTime.innerText = toHHMMSS(song.currentTime);
  miniCurrentTime.innerText = toHHMMSS(song.currentTime).slice(3);
}

function jumpTo(event) {
  const jumpToTime = (event.offsetX / progressContainer.clientWidth) * song.duration;
  song.currentTime = jumpToTime;
}

miniProgressContainer.addEventListener('click', (event) => {
  const rect = miniProgressContainer.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const newTime = (clickX / rect.width) * song.duration;
  song.currentTime = newTime;
});

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * arr.length);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function shuffleButtonClicked() {
  isShuffled
    ? (sortedPlaylist = [...originalPlaylist], isShuffled = false, shuffleButton.classList.remove('button-active'))
    : (shuffleArray(sortedPlaylist), isShuffled = true, shuffleButton.classList.add('button-active'));
}

function repeatButtonButtonClicked() {
  repeatOn
    ? (repeatOn = false, repeatButton.classList.remove('button-active'))
    : (repeatOn = true, repeatButton.classList.add('button-active'));
}

function nextOrRepeat() {
  repeatOn ? playSong() : nextSong();
}

function toHHMMSS(sec) {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.floor(sec % 60);
  return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

function updateTotalTime() {
  totalTime.innerText = toHHMMSS(song.duration);
  miniTotalTime.innerText = toHHMMSS(song.duration).slice(3);
}

function likeButtonClicked() {
  sortedPlaylist[index].liked = !sortedPlaylist[index].liked;
  const origIndex = originalPlaylist.findIndex(item => item.file === sortedPlaylist[index].file);
  if (origIndex !== -1) originalPlaylist[origIndex].liked = sortedPlaylist[index].liked;
  localStorage.setItem('playlist', JSON.stringify(originalPlaylist));
  organizePlaylistByLikes();
  likeButtonRender();
}

function organizePlaylistByLikes() {
  const currentSong = sortedPlaylist[index];
  sortedPlaylist.sort((a,b) => b.liked - a.liked);
  index = sortedPlaylist.findIndex(song => song.file === currentSong.file);
}

function back5seconds() { song.currentTime = Math.max(0, song.currentTime - 5); }
function skip5seconds() { song.currentTime = Math.min(song.duration, song.currentTime + 5); }

// === INICIALIZAÇÃO ===
organizePlaylistByLikes();
initializeSong();

// === EVENT LISTENERS ===
play.addEventListener('click', playPauseDecider);
miniPlay.addEventListener('click', playPauseDecider);
previous.addEventListener('click', previousSong);
miniPrev.addEventListener('click', previousSong);
next.addEventListener('click', nextSong);
miniNext.addEventListener('click', nextSong);

song.addEventListener('timeupdate', updateProgress);
song.addEventListener('ended', nextOrRepeat);
song.addEventListener('loadedmetadata', updateTotalTime);

progressContainer.addEventListener('click', jumpTo);
shuffleButton.addEventListener('click', shuffleButtonClicked);
repeatButton.addEventListener('click', repeatButtonButtonClicked);
likeButton.addEventListener('click', likeButtonClicked);
back5Sec.addEventListener('click', back5seconds);
skip5Sec.addEventListener('click', skip5seconds);

window.addEventListener('load', ajustarLargura);
window.addEventListener('resize', ajustarLargura);

//teste de git//
