document.addEventListener("DOMContentLoaded", function () {
    // Esperar a que el DOM cargue completamente antes de ejecutar el código

    const comunidadAutonoma = document.getElementById("ccaa"); // Guardo en variable los selects del formulario, select == desplegable
    const provincia = document.getElementById("provincia"); // Select de Provincia
    const poblacion = document.getElementById("poblacion"); // Select de Población
    const imageContainer = document.getElementById("image-container"); // Contenedor de imágenes
    const form = document.querySelector("form"); // Formulario para capturar el evento de envío

    console.log("Cargando script...");

    // Cargar las comunidades autónomas al cargar la página
    fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/ccaa.json")
        .then(response => response.json()) // Convertimos la respuesta en un JSON
        .then(data => {
            console.log("Comunidades Autónomas cargadas:", data); // Verificar datos
            data.forEach(comunidad => { // Recorro el array de comunidades del JSON
                let option = document.createElement("option");
                option.value = comunidad.code; // Asigno el ID de la comunidad como valor
                option.textContent = comunidad.label; // Muestra el nombre en el desplegable
                comunidadAutonoma.appendChild(option);
            });
        })
        .catch(error => console.error("Error al cargar las Comunidades Autónomas:", error));

    // Cargar provincias cuando se selecciona una comunidad autónoma
    comunidadAutonoma.addEventListener("change", function () {
        console.log("Comunidad seleccionada:", comunidadAutonoma.value); // Verificar en consola

        provincia.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        poblacion.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>'; // Reset poblaciones

        fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/provincias.json")
            .then(response => response.json()) // Convertimos la respuesta a JSON
            .then(data => {
                console.log("Provincias cargadas:", data);
                let provinciasFiltradas = data.filter(prov => prov.parent_code === comunidadAutonoma.value);
                if (provinciasFiltradas.length === 0) {
                    console.warn("No se encontraron provincias para esta comunidad.");
                    return;
                }
                provinciasFiltradas.forEach(prov => {
                    let option = document.createElement("option");
                    option.value = prov.code;
                    option.textContent = prov.label;
                    provincia.appendChild(option);
                });
            })
            .catch(error => console.error("Error al cargar las provincias:", error));
    });

    // Cargar poblaciones cuando se selecciona una provincia
    provincia.addEventListener("change", function () {
        console.log("Provincia seleccionada:", provincia.value); // Verificar en consola

        poblacion.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';

        fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/poblaciones.json")
            .then(response => response.json()) // Convertimos la respuesta en JSON
            .then(data => {
                console.log("Poblaciones cargadas:", data);
                let poblacionesFiltradas = data.filter(pobl => pobl.parent_code === provincia.value);
                if (poblacionesFiltradas.length === 0) {
                    console.warn("No se encontraron poblaciones para esta provincia.");
                    return;
                }
                poblacionesFiltradas.forEach(pob => {
                    let option = document.createElement("option");
                    option.value = pob.label; // Guardamos el nombre de la población como valor
                    option.textContent = pob.label;
                    poblacion.appendChild(option);
                });
            })
            .catch(error => console.error("Error al cargar las poblaciones:", error));
    });

    // Obtener imágenes de Wikimedia al enviar el formulario
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Bloquear el envío del formulario para ejecutar la lógica

        let poblacionSeleccionada = poblacion.value; // Obtiene el valor de la población seleccionada
        if (!poblacionSeleccionada) {
            alert("Selecciona una población");
            return;
        }

        console.log("Buscando imágenes de:", poblacionSeleccionada);

        imageContainer.innerHTML = ""; // Limpiar imágenes previas antes de mostrar nuevas

        // Generar la URL para obtener imágenes de Wikimedia Commons
        let url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=images&titles=${encodeURIComponent(poblacionSeleccionada)}&gimlimit=10&prop=imageinfo&iiprop=url`;

        console.log("URL generada para imágenes:", url);

        fetch(url)
            .then(response => response.json()) // Convertimos la respuesta en JSON
            .then(data => {
                console.log("Respuesta de Wikimedia:", data);
                imageContainer.innerHTML = ""; // Limpiar imágenes anteriores

                if (data.query && data.query.pages) {
                    Object.values(data.query.pages).forEach(page => {
                        if (page.imageinfo) {
                            let imageBox = document.createElement("div");
                            imageBox.classList.add("image-box");

                            let img = document.createElement("img");
                            img.src = page.imageinfo[0].url;
                            img.alt = `Imagen de ${poblacionSeleccionada}`;

                            let fullscreenBtn = document.createElement("button");
                            fullscreenBtn.classList.add("fullscreen-btn");
                            fullscreenBtn.innerHTML = "🔍 Pantalla completa";

                            // Abrir imagen en pantalla completa al pulsar el botón
                            fullscreenBtn.addEventListener("click", function (e) {
                                e.stopPropagation(); // Evitar que cualquier otro evento se dispare
                                if (img.requestFullscreen) {
                                    img.requestFullscreen();
                                } else if (img.mozRequestFullScreen) { // Firefox
                                    img.mozRequestFullScreen();
                                } else if (img.webkitRequestFullscreen) { // Chrome, Safari
                                    img.webkitRequestFullscreen();
                                } else if (img.msRequestFullscreen) { // IE/Edge
                                    img.msRequestFullscreen();
                                }
                            });

                            // Añadir imagen y botón al contenedor
                            imageBox.appendChild(img);
                            imageBox.appendChild(fullscreenBtn);

                            imageContainer.appendChild(imageBox);
                        }
                    });

                } else {
                    imageContainer.innerHTML = "<p>No se encontraron imágenes para esta población.</p>";
                }
            })
            .catch(error => {
                console.error("Error obteniendo imágenes:", error);
                imageContainer.innerHTML = "<p>Error al obtener imágenes. Inténtalo de nuevo.</p>";
            });
    });
});
