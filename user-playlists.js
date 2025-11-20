// user-playlists.js — VERSÃO FINAL

// CARREGA TODAS AS PLAYLISTS DO LOCALSTORAGE
function loadCollections() {
  return JSON.parse(localStorage.getItem("playlists_collections") || "{}");
}

// SALVA TODAS AS PLAYLISTS NO LOCALSTORAGE
function saveCollections(data) {
  localStorage.setItem("playlists_collections", JSON.stringify(data));
}

// MOSTRAR LISTA DE PLAYLISTS
function renderPlaylists() {
  const container = document.getElementById("lista-playlists");
  const collections = loadCollections();

  container.innerHTML = "";

  const names = Object.keys(collections);
  if (names.length === 0) {
    container.innerHTML = "<p>Nenhuma playlist criada ainda.</p>";
    return;
  }

  names.forEach(name => {
    const div = document.createElement("div");
    div.className = "playlist-box";
    div.innerHTML = `
      <p><b>${name}</b> — ${collections[name].length} música(s)</p>
      <div class="acoes">
        <button class="abrir-playlist" data-list="${name}">Abrir no Player</button>
        <button class="apagar-playlist" data-list="${name}">Apagar</button>
      </div>
    `;
    container.appendChild(div);
  });

  // abrir / apagar handlers
  document.querySelectorAll(".abrir-playlist").forEach(btn => {
    btn.addEventListener("click", () => {
      const list = btn.dataset.list;
      const collections = loadCollections();
      const playlist = collections[list] || [];
      localStorage.setItem("user_playlist", JSON.stringify(playlist));
      localStorage.setItem("playlist_source", "user");
      window.location.href = "playlist-original.html";
    });
  });

  document.querySelectorAll(".apagar-playlist").forEach(btn => {
    btn.addEventListener("click", () => {
      const list = btn.dataset.list;
      if (!confirm(`Apagar playlist "${list}"?`)) return;
      const collections = loadCollections();
      delete collections[list];
      saveCollections(collections);
      renderPlaylists();
    });
  });
}

// LER ARQUIVO E CONVERTER PARA BASE64
function fileToBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// BOTÃO SALVAR
document.getElementById("salvar-musica").addEventListener("click", async () => {
  const arrayName = document.getElementById("array-name").value.trim();
  const songName = document.getElementById("song-name-input").value.trim();
  const artist = document.getElementById("artist-input").value.trim();
  const fileName = document.getElementById("file-name-input").value.trim();
  const audioFile = document.getElementById("audio-file").files[0];
  const imageFile = document.getElementById("image-file").files[0];

  if (!arrayName || !songName || !audioFile) {
    alert("Preencha os campos obrigatórios * antes de salvar.");
    return;
  }

  // validar nomes (sem espaços especiais)
  const validName = (n) => /^[A-Za-z0-9_\-]+$/.test(n);
  if (!validName(arrayName)) {
    alert("Nome da playlist inválido. Use apenas letras, números, _ ou -");
    return;
  }

  let collections = loadCollections();
  if (!collections[arrayName]) collections[arrayName] = [];

  const audioBase64 = await fileToBase64(audioFile);
  let imageBase64 = null;
  if (imageFile) imageBase64 = await fileToBase64(imageFile);

  const newSong = {
    songName,
    artist,
    file: fileName || songName.replace(/\s+/g, "_"),
    src: audioBase64,
    img: imageBase64,
    liked: false
  };

  // adiciona ao array existente (não substitui)
  collections[arrayName].push(newSong);
  saveCollections(collections);

  // atualiza user_playlist para abrir no player com todas as músicas recentes
  localStorage.setItem("user_playlist", JSON.stringify(collections[arrayName]));
  localStorage.setItem("playlist_source", "user");

  if (confirm("Música salva! Abrir playlist no player?")) {
    window.location.href = "playlist-original.html";
  } else {
    renderPlaylists();
  }
});

// INICIAR
renderPlaylists();
