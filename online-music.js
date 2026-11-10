/* Online catalogue used by the shared Mind audio player. */
window.OnlineMusic = (() => {
  const sources = ['https://api.i-meto.com/meting/api', 'https://api.qijieya.cn/meting/'];
  const results = document.getElementById('net-results');
  const status = document.getElementById('net-status');
  const query = document.getElementById('net-query');
  let requestId = 0;

  function endpoint(base, type, id) {
    const url = new URL(base);
    url.search = new URLSearchParams({server:'netease', type, id});
    return url.href;
  }

  function trackFrom(row) {
    if (!row || !row.url || !(row.name || row.title)) return null;
    let url;
    try { url = new URL(row.url); } catch { return null; }
    const id = url.searchParams.get('id');
    if (!sources.some(base => new URL(base).origin === url.origin) || !/^\d+$/.test(id)) return null;
    return {id:'netease-' + id, onlineId:id, title:row.name || row.title,
      artist:row.artist || row.author || '未知歌手', dataUrl:url.href};
  }

  function addToLibrary(song) {
    const songs = state.musicLibrary.songs;
    let index = songs.findIndex(item => item.id === song.id);
    if (index === -1) index = songs.push(song) - 1;
    else Object.assign(songs[index], song);
    return index;
  }

  function select(song) {
    const index = addToLibrary(song);
    saveState();
    renderMusicList();
    document.getElementById('lt-song').value = song.id;
    playMusic(index);
  }

  async function catalogue(term) {
    let received = false;
    for (const base of sources) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(endpoint(base, term ? 'search' : 'playlist', term || '3778678'), {
          signal:controller.signal, credentials:'omit', referrerPolicy:'no-referrer'
        });
        if (!response.ok) continue;
        const rows = await response.json();
        if (!Array.isArray(rows)) continue;
        received = true;
        const songs = rows.map(trackFrom).filter(Boolean);
        if (!songs.length) continue;
        return songs;
      } catch { /* Continue with the next source. */ }
      finally { clearTimeout(timer); }
    }
    return received ? [] : null;
  }

  async function recommend(previous) {
    const chart = await catalogue('');
    if (!chart?.length) return null;
    const pool = chart.filter(song => song.id !== previous);
    const fresh = pool.filter(song => !state.musicLibrary.songs.some(item => item.id === song.id));
    const choices = fresh.length ? fresh : pool.length ? pool : chart;
    return choices[Math.floor(Math.random() * choices.length)];
  }
  async function load(term) {
    const token = ++requestId;
    results.replaceChildren();
    status.textContent = term ? '正在搜歌…' : '正在读取网易云热歌榜…';
    const rows = await catalogue(term);
    if (token !== requestId) return;
    if (rows?.length) {
      const songs = rows.slice(0,50);
        for (const song of songs) {
          const button = document.createElement('button');
          const artist = document.createElement('small');
          artist.textContent = song.artist;
          button.append(song.title, artist);
          button.onclick = () => select(song);
          results.append(button);
        }
        status.textContent = (term ? '搜索结果' : '网易云热歌榜') + ' · ' + songs.length + ' 首，点歌播放';
      return;
    }
    status.textContent = rows && term ? '没有搜到这首歌，试试歌手名。' : '曲库暂时连不上，点热歌榜或搜索重试。';
  }
  function prepare(player, song) {
    player.onerror = null;
    if (!song.onlineId) return;
    const alternatives = [endpoint(sources[1], 'url', song.onlineId),
      'https://music.163.com/song/media/outer/url?id=' + encodeURIComponent(song.onlineId) + '.mp3'];
    player.onerror = () => {
      if (state.musicLibrary.songs[currentMusicIndex]?.id !== song.id) return;
      const next = alternatives.find(url => url !== player.src && url !== song.dataUrl);
      if (!next) {
        player.onerror = null;
        showToast('这首歌暂时无法在线播放，请换一首');
        return;
      }
      alternatives.splice(0, alternatives.indexOf(next) + 1);
      player.src = next;
      player.play().catch(error => {
        if (error.name === 'NotAllowedError') showToast('请点播放器的播放键');
      });
    };
  }

  document.getElementById('net-search').onsubmit = event => {
    event.preventDefault();
    load(query.value.trim());
  };
  document.getElementById('net-chart').onclick = () => { query.value = ''; load(''); };
  return {prepare, recommend, addToLibrary, open() { if (!requestId) load(''); }};
})();
