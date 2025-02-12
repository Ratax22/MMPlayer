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

            files.forEach(file => {
                const li = document.createElement('li');
                li.textContent = file;
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Eliminar';
                deleteButton.addEventListener('click', () => deleteFile(file));
                li.appendChild(deleteButton);
                fileList.appendChild(li);
            });
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