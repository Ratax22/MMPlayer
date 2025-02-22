document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const uploadStatus = document.getElementById('uploadStatus');
    const fileList = document.getElementById('fileList');
    const processStatus = document.getElementById('processStatus');
    const statusMessage = document.getElementById('statusMessage');
    const outputDiv = document.getElementById('outputDiv');
    const outputContent = document.getElementById('outputContent');
    const toggleOutputButton = document.getElementById('toggleOutputButton');

    let isOutputVisible = false;

    // Cargar la lista de archivos al iniciar
    loadFileList();

    // Subir archivos
    uploadButton.addEventListener('click', async () => {
        const files = fileInput.files;
        if (files.length === 0) {
            uploadStatus.textContent = 'Por favor, selecciona al menos un archivo.';
            return;
        }

        const formData = new FormData();
        for (const file of files) {
            formData.append('files[]', file);
        }

        try {
            uploadStatus.textContent = 'Subiendo y optimizando videos...';
            const response = await fetch('upload.php', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Error al subir los archivos.');

            const result = await response.json();
            uploadStatus.textContent = result.message;

            // Mostrar el estado del proceso
            statusMessage.textContent = result.message;
            processStatus.style.display = 'flex';

            // Cambiar el color del borde según el resultado
            if (result.message.includes('correctamente')) {
                processStatus.classList.remove('error');
                processStatus.classList.add('success');
            } else {
                processStatus.classList.remove('success');
                processStatus.classList.add('error');
            }

            // Mostrar el output del comando FFmpeg
            outputContent.textContent = result.output || 'No hay output disponible';
            outputDiv.style.display = 'none'; // Ocultar el output inicialmente
            toggleOutputButton.textContent = 'Mostrar Output';

            loadFileList(); // Recargar la lista de archivos
        } catch (error) {
            uploadStatus.textContent = error.message;
        }
    });

    // Botón para mostrar/ocultar el output
    toggleOutputButton.addEventListener('click', () => {
        isOutputVisible = !isOutputVisible;
        outputDiv.style.display = isOutputVisible ? 'block' : 'none';
        toggleOutputButton.textContent = isOutputVisible ? 'Ocultar Output' : 'Mostrar Output';
    });

// Cargar lista de archivos
async function loadFileList() {
    try {
        const response = await fetch('list.php');
        if (!response.ok) throw new Error('Error al cargar la lista de archivos.');

        const files = await response.json();
        fileList.innerHTML = '';

        // Cargar settings
        const settingsResponse = await fetch('get_settings.php');
        const settings = await settingsResponse.json();

        files.forEach(file => {
            const li = document.createElement('li');
            li.textContent = file;

            // Crear campos de entrada
            const rotationInput = document.createElement('input');
            rotationInput.type = 'number';
            rotationInput.min = '0';
            rotationInput.max = '360';
            rotationInput.value = settings[file]?.rotation || 0;
            rotationInput.placeholder = 'Rotación (0-360)';

            const scaleXInput = document.createElement('input');
            scaleXInput.type = 'number';
            scaleXInput.min = '-2.0';
            scaleXInput.max = '2.0';
            scaleXInput.step = '0.1';
            scaleXInput.value = settings[file]?.scaleX || 0;
            scaleXInput.placeholder = 'Escala X (-2.0 a 2.0)';

            const scaleYInput = document.createElement('input');
            scaleYInput.type = 'number';
            scaleYInput.min = '-2.0';
            scaleYInput.max = '2.0';
            scaleYInput.step = '0.1';
            scaleYInput.value = settings[file]?.scaleY || 0;
            scaleYInput.placeholder = 'Escala Y (-2.0 a 2.0)';

            // Botón de confirmación
            const confirmButton = document.createElement('button');
            confirmButton.textContent = '✓';
            confirmButton.addEventListener('click', () => saveSettings(file, rotationInput.value, scaleXInput.value, scaleYInput.value));

            // Botón de eliminar
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.addEventListener('click', () => deleteFile(file));

            // Agregar elementos al li
            li.appendChild(rotationInput);
            li.appendChild(scaleXInput);
            li.appendChild(scaleYInput);
            li.appendChild(confirmButton);
            li.appendChild(deleteButton);

            fileList.appendChild(li);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Guardar configuración
async function saveSettings(filename, rotation, scaleX, scaleY) {
    try {
        const response = await fetch('save_settings.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename, rotation, scaleX, scaleY }),
        });

        if (!response.ok) throw new Error('Error al guardar la configuración.');

        const result = await response.json();
        console.log(result.message);
    } catch (error) {
        console.error('Error:', error);
    }
}
    // Eliminar archivo
    async function deleteFile(filename) {
        try {
            const response = await fetch('delete.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename }),
            });

            if (!response.ok) throw new Error('Error al eliminar el archivo.');

            const result = await response.json();
            console.log(result.message);
            loadFileList(); // Recargar la lista de archivos
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const cleanCacheButton = document.getElementById('cleanCacheButton');

    // Cargar el estado de CleanCache al iniciar
    loadCleanCacheState();

    // Función para cargar el estado de CleanCache
    async function loadCleanCacheState() {
        try {
            const response = await fetch('get_settings.php');
            if (!response.ok) throw new Error('Error al cargar los ajustes');
            const settings = await response.json();
            const cleanCache = settings.CleanCache || 0;

            // Actualizar el botón
            cleanCacheButton.classList.toggle('active', cleanCache === 1);
        } catch (error) {
            console.error('Error al cargar el estado de CleanCache:', error);
        }
    }

    // Función para actualizar el valor de CleanCache
    async function updateCleanCache(value) {
        try {
            const response = await fetch('update_clean_cache.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ CleanCache: value }),
            });

            if (!response.ok) throw new Error('Error al actualizar CleanCache');

            const result = await response.json();
            console.log(result.message);

            // Actualizar el botón
            cleanCacheButton.classList.toggle('active', value === 1);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Evento para el botón de limpiar caché
    cleanCacheButton.addEventListener('click', () => {
        const newValue = cleanCacheButton.classList.contains('active') ? 0 : 1;
        updateCleanCache(newValue);
    });
});
