document.addEventListener('DOMContentLoaded', () => {
    const player = new Plyr('#player', {
        fullscreen: { enabled: true, iosNative: true },
        controls: [],
        autoplay: true,
    });

    const dbName = 'VideoPlayerDB';
    const storeName = 'videos';
    let db;
    let playlist = []; // Almacena la playlist actual
    let currentVideoIndex = 0;
    let settings = {}; // Almacena los ajustes de los videos

    // Función para cargar los ajustes desde settings.txt
    async function loadSettings() {
        try {
            const response = await fetch('Multimedia/Videos/settings.txt');
            if (!response.ok) throw new Error('Error al cargar los ajustes');
            const data = await response.text();
            settings = JSON.parse(data);
            console.log('Ajustes cargados:', settings);

            // Verificar si CleanCache está activo
            if (settings.CleanCache === 1) {
                console.log('Limpiando caché del navegador...');
                await clearBrowserCache();
                settings.CleanCache = 0; // Restablecer el valor
                await updateSettings(); // Guardar los cambios
            }
        } catch (error) {
            console.error('Error al cargar los ajustes:', error);
            settings = {};
        }
    }

    // Función para limpiar la caché del navegador
    async function clearBrowserCache() {
        try {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => console.log('Caché del navegador limpiada');
            request.onerror = () => console.error('Error al limpiar la caché');
        } catch (error) {
            console.error('Error al limpiar la caché:', error);
        }
    }

    // Función para actualizar settings.txt
    async function updateSettings() {
        try {
            const response = await fetch('update_clean_cache.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) throw new Error('Error al actualizar los ajustes');
            console.log('Ajustes actualizados correctamente');
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Resto del código del reproductor...
});

document.addEventListener('DOMContentLoaded', () => {
    const player = new Plyr('#player', {
        fullscreen: { enabled: true, iosNative: true },
        controls: [],
        autoplay: true,
    });

    const dbName = 'VideoPlayerDB';
    const storeName = 'videos';
    let db;
    let playlist = []; // Almacena la playlist actual
    let currentVideoIndex = 0;
    let settings = {}; // Almacena los ajustes de los videos

    // Conectar al servidor WebSocket
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
        console.log('Conectado al servidor WebSocket');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.action === 'play') {
            player.currentTime = data.time;
            player.play();
        } else if (data.action === 'pause') {
            player.pause();
        }
    };

    socket.onerror = (error) => {
        console.error('Error en la conexión WebSocket:', error);
    };

    socket.onclose = () => {
        console.log('Conexión WebSocket cerrada');
    };

    // Abrir o crear la base de datos IndexedDB
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'name' });
        }
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        initPlayer();
    };

    request.onerror = (event) => {
        console.error('Error al abrir IndexedDB:', event.target.error);
    };

    // Función para cargar los ajustes desde settings.txt
    async function loadSettings() {
        try {
            const response = await fetch('Multimedia/Videos/settings.txt');
            if (!response.ok) throw new Error('Error al cargar los ajustes');
            const data = await response.text();
            settings = JSON.parse(data);
            console.log('Ajustes cargados:', settings);
        } catch (error) {
            console.error('Error al cargar los ajustes:', error);
            settings = {};
        }
    }

    // Función para aplicar transformaciones CSS al video
    function applyVideoTransformations(videoName) {
        const videoElement = document.querySelector('#player');
        if (!videoElement) return;

        const videoSettings = settings[videoName] || { rotation: 0, scaleX: 0, scaleY: 0 };

        // Aplicar transformaciones CSS
        videoElement.style.transform = `
            rotate(${videoSettings.rotation}deg)
            scaleX(${1 + parseFloat(videoSettings.scaleX)})
            scaleY(${1 + parseFloat(videoSettings.scaleY)})
        `;
        console.log(`Transformaciones aplicadas al video: ${videoName}`);
    }

    // Función para guardar un video en IndexedDB
    function saveVideoToDB(name, blob) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({ name, blob });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Función para obtener un video desde IndexedDB
    function getVideoFromDB(name) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(name);

            request.onsuccess = () => resolve(request.result ? request.result.blob : null);
            request.onerror = () => reject(request.error);
        });
    }

    // Función para descargar un video desde el servidor
    async function fetchVideo(name) {
        const response = await fetch(`Multimedia/Videos/${name}`);
        if (!response.ok) throw new Error(`Error al descargar el video: ${name}`);
        return await response.blob();
    }

    // Función para obtener la playlist del servidor
    async function fetchPlaylist() {
        try {
            const response = await fetch('get_playlist.php');
            if (!response.ok) throw new Error('Error al cargar la playlist');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    // Función para verificar si la playlist en el servidor ha cambiado
    async function checkPlaylistForChanges() {
        const serverPlaylist = await fetchPlaylist();
        if (JSON.stringify(serverPlaylist) !== JSON.stringify(playlist)) {
            console.log('La playlist en el servidor ha cambiado. Se cargará la nueva playlist.');
            return serverPlaylist; // Devuelve la nueva playlist
        }
        return null; // No hay cambios
    }

    // Función para cargar la playlist y los videos
    async function loadPlaylist() {
        const newPlaylist = await fetchPlaylist();
        if (newPlaylist.length === 0) {
            console.error('No hay videos en la playlist.');
            return;
        }

        // Descargar y guardar cada video en IndexedDB si no está ya almacenado
        for (const videoName of newPlaylist) {
            const videoBlob = await getVideoFromDB(videoName);
            if (!videoBlob) {
                console.log(`Descargando video: ${videoName}`);
                const blob = await fetchVideo(videoName);
                await saveVideoToDB(videoName, blob);
                console.log(`Video guardado en IndexedDB: ${videoName}`);
            } else {
                console.log(`Video encontrado en IndexedDB: ${videoName}`);
            }
        }

        playlist = newPlaylist; // Actualiza la playlist actual
        return playlist;
    }

    // Función para cargar un video específico desde IndexedDB
    async function loadVideo(index) {
        const videoName = playlist[index];
        const videoBlob = await getVideoFromDB(videoName);
        if (!videoBlob) {
            console.error(`Video no encontrado: ${videoName}`);
            return;
        }

        const videoUrl = URL.createObjectURL(videoBlob);
        const videoElement = document.querySelector('#player');
        videoElement.src = videoUrl;
        videoElement.play();

        // Aplicar transformaciones CSS al video
        applyVideoTransformations(videoName);

        console.log(`Video cargado y reproduciendo: ${videoName}`);
    }

    // Función para inicializar el reproductor
    async function initPlayer() {
        await loadSettings(); // Cargar los ajustes de los videos
        await loadPlaylist();
        if (playlist.length === 0) return;

        // Función para manejar la reproducción de videos
        async function playNextVideo() {
            // Verificar si la playlist en el servidor ha cambiado
            const newPlaylist = await checkPlaylistForChanges();
            if (newPlaylist) {
                await loadPlaylist(); // Cargar la nueva playlist
                currentVideoIndex = 0; // Reiniciar el índice de reproducción
            }

            // Cargar y reproducir el siguiente video
            loadVideo(currentVideoIndex);

            // Actualizar el índice para el próximo video
            currentVideoIndex = (currentVideoIndex + 1) % playlist.length;
        }

        // Evento cuando termina un video
        player.on('ended', () => {
            playNextVideo();
        });

        // Evento para sincronizar el tiempo de reproducción
        player.on('timeupdate', () => {
            socket.send(JSON.stringify({ action: 'timeupdate', time: player.currentTime }));
        });

        // Evento para sincronizar la reproducción
        player.on('play', () => {
            socket.send(JSON.stringify({ action: 'play', time: player.currentTime }));
        });

        // Evento para sincronizar la pausa
        player.on('pause', () => {
            socket.send(JSON.stringify({ action: 'pause' }));
        });

        // Iniciar la reproducción del primer video
        playNextVideo();
    }
});
