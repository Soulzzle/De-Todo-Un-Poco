// Link CSV de Google Sheets:
const urlGoogleSheet = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd9-z8x-I9S7F53ejauUthwDdnEy0wB7ei8RLRVVkyD8y1m3CWHDlBgxhURb1a3-Fde2tr-7C0Auue/pub?output=csv";

// Contenedor donde se inyectan los productos
const contenedor = document.getElementById('contenedor-productos');

let todosLosProductos = [];
let productosFiltradosActuales = [];
let categoriaSeleccionada = null;

const productosPorPagina = 12;
let paginaActual = 1;

async function cargarProductos() {
    if (!contenedor) {
        console.error("No se encontró el ul con id 'contenedor-productos'");
        return;
    }

    // Mostramos mensaje de cargando mientras se hace la petición
    contenedor.innerHTML = '<p class="mensaje-cargando">Cargando productos...</p>';

    try {
        // Pedimos los datos a Google Sheets
        const respuesta = await fetch(urlGoogleSheet);
        const datosCSV = await respuesta.text();

        // Convertimos el texto CSV a una lista de objetos que JavaScript entienda
        todosLosProductos = csvToJson(datosCSV);

        // Inicializamos los listeners de eventos para la búsqueda y los filtros
        inicializarFiltros();

        // Renderizamos inicialmente todos los productos aplicables
        aplicarFiltros();

    } catch (error) {
        console.error("Error al cargar la planilla de Google Sheets:", error);
        if (contenedor) contenedor.innerHTML = '<p class="mensaje-cargando">Error al cargar los productos. Intente nuevamente más tarde.</p>';
    }
}

// Leer parámetros de búsqueda y filtros desde la URL (ej: ?busqueda=almendras o ?categoria=Frutos Secos)
function leerParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    const busqueda = params.get('busqueda') || params.get('q') || params.get('buscar');
    const categoria = params.get('categoria');
    const clasificacion = params.get('clasificacion');

    if (busqueda) {
        const busquedaInput = document.getElementById('busqueda-productos');
        if (busquedaInput) busquedaInput.value = busqueda;
    }

    if (categoria) {
        const radio = document.querySelector(`input[name="categoria"][value="${decodeURIComponent(categoria)}"]`);
        if (radio) {
            radio.checked = true;
            categoriaSeleccionada = radio.value;
        }
    }

    if (clasificacion) {
        const checkbox = document.querySelector(`input[name="clasificacion"][value="${decodeURIComponent(clasificacion)}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    }
}

// Inicializar listeners de interacción para la barra de búsqueda y filtros laterales
function inicializarFiltros() {
    const busquedaInput = document.getElementById('busqueda-productos');
    if (busquedaInput) {
        busquedaInput.addEventListener('input', aplicarFiltros);
        busquedaInput.addEventListener('search', aplicarFiltros); // Soporta el botón de limpiar "x" en inputs type="search"
    }

    // Listener para clasificaciones (multi-selección)
    const clasificacionCheckboxes = document.querySelectorAll('input[name="clasificacion"]');
    clasificacionCheckboxes.forEach(cb => {
        cb.addEventListener('change', aplicarFiltros);
    });

    // Listener para categorías (selección única con capacidad de deseleccionar)
    const categoriaRadios = document.querySelectorAll('input[name="categoria"]');
    categoriaRadios.forEach(radio => {
        radio.addEventListener('click', function () {
            if (categoriaSeleccionada === this.value) {
                this.checked = false;
                categoriaSeleccionada = null;
            } else {
                categoriaSeleccionada = this.value;
            }
            aplicarFiltros();
        });
    });

    // Cargar filtros especificados en los parámetros de la URL
    leerParametrosURL();
}

function inicializarToggleFiltrosMobile() {
    const btnToggle = document.getElementById('btn-toggle-filtros');
    const panel = document.getElementById('panel-filtros-desplegable');

    if (!btnToggle || !panel) return;

    function togglePanel(e) {
        if (e && e.cancelable) e.preventDefault();
        const estaAbierto = panel.classList.contains('active');
        if (estaAbierto) {
            panel.classList.remove('active');
            btnToggle.setAttribute('aria-expanded', 'false');
        } else {
            panel.classList.add('active');
            btnToggle.setAttribute('aria-expanded', 'true');
        }
    }

    btnToggle.addEventListener('click', togglePanel);
    btnToggle.addEventListener('touchstart', togglePanel, { passive: false });
}

function actualizarBadgeFiltros() {
    const badge = document.getElementById('badge-filtros-activos');
    if (!badge) return;

    const numClasif = document.querySelectorAll('input[name="clasificacion"]:checked').length;
    const numCat = categoriaSeleccionada ? 1 : 0;
    const totalActivos = numClasif + numCat;

    if (totalActivos > 0) {
        badge.textContent = totalActivos;
        badge.style.display = 'inline-flex';
    } else {
        badge.style.display = 'none';
    }
}

// Función auxiliar para normalizar texto (quitar acentos, pasar a minúsculas)
function normalizarTexto(texto) {
    return (texto || '')
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// Función auxiliar para comprobar si un valor en la planilla es afirmativo ("Sí", "Si", "True", "1", "s")
function esAfirmativo(val) {
    if (!val) return false;
    const v = normalizarTexto(val);
    return v === 'si' || v === 'true' || v === '1' || v === 's';
}

function aplicarFiltros() {
    if (!contenedor) return;

    const busquedaInput = document.getElementById('busqueda-productos');
    const terminoBusqueda = busquedaInput ? normalizarTexto(busquedaInput.value) : '';

    const clasificacionesActivas = Array.from(
        document.querySelectorAll('input[name="clasificacion"]:checked')
    ).map(cb => normalizarTexto(cb.value));

    const categoriaActiva = categoriaSeleccionada ? normalizarTexto(categoriaSeleccionada) : null;

    productosFiltradosActuales = todosLosProductos.filter(producto => {
        // LÓGICA DE NEGOCIO: Si no tiene nombre, ignoramos la fila
        if (!producto.nombre || producto.nombre.trim() === "") {
            return false;
        }

        // LÓGICA DE NEGOCIO: Si en el Excel dice "No" en disponible, saltamos al siguiente
        if (producto.disponible && normalizarTexto(producto.disponible) === "no") {
            return false;
        }

        const nombreNorm = normalizarTexto(producto.nombre);
        const descripcionNorm = normalizarTexto(producto.descripcion);
        const categoriaProdNorm = normalizarTexto(producto.categoria);
        const marcaNorm = normalizarTexto(producto.marca);
        const todoTexto = `${nombreNorm} ${descripcionNorm} ${categoriaProdNorm} ${marcaNorm}`;

        // 1. Filtro por Búsqueda (Búsqueda multi-palabra flexible)
        if (terminoBusqueda !== '') {
            const palabrasBusqueda = terminoBusqueda.split(/\s+/).filter(p => p.length > 0);
            const coincideTodas = palabrasBusqueda.every(palabra => todoTexto.includes(palabra));
            if (!coincideTodas) {
                return false;
            }
        }

        // 2. Filtro por Clasificaciones (Multi-selección)
        if (clasificacionesActivas.length > 0) {
            const cumpleTodasClasificaciones = clasificacionesActivas.every(clasif => {
                if (clasif.includes('tacc')) {
                    const valColumna = producto.sintacc || producto['sin tacc'] || producto.tacc;
                    return esAfirmativo(valColumna) || todoTexto.includes('tacc');
                }
                if (clasif.includes('azucar')) {
                    const valColumna = producto.sinazucar || producto['sin azucar'] || producto.azucar;
                    return esAfirmativo(valColumna) || todoTexto.includes('azucar');
                }
                if (clasif.includes('vegano')) {
                    const valColumna = producto.vegano || producto.saludable;
                    return esAfirmativo(valColumna) || todoTexto.includes('vegano');
                }
                return todoTexto.includes(clasif);
            });

            if (!cumpleTodasClasificaciones) return false;
        }

        // 3. Filtro por Categoría (Selección Única)
        if (categoriaActiva) {
            let coincideCat = categoriaProdNorm === categoriaActiva;

            if (!coincideCat) {
                const palabrasActiva = categoriaActiva.split(/[\/\s,]+/).filter(p => p.length > 0);
                const palabrasProd = categoriaProdNorm.split(/[\/\s,]+/).filter(p => p.length > 0);

                coincideCat = palabrasActiva.some(pActiva =>
                    palabrasProd.some(pProd => {
                        if (pActiva === pProd) return true;
                        if (pActiva.startsWith(pProd) || pProd.startsWith(pActiva)) {
                            return Math.min(pActiva.length, pProd.length) >= 2;
                        }
                        return false;
                    })
                );
            }

            if (!coincideCat) return false;
        }

        return true;
    });

    actualizarBadgeFiltros();
    paginaActual = 1;
    renderizarPaginaActual();
}

function renderizarPaginaActual() {
    const totalProductos = productosFiltradosActuales.length;
    const totalPaginas = Math.ceil(totalProductos / productosPorPagina) || 1;

    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    if (paginaActual < 1) paginaActual = 1;

    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = Math.min(inicio + productosPorPagina, totalProductos);
    const productosPagina = productosFiltradosActuales.slice(inicio, fin);

    renderizarProductos(productosPagina);
    renderizarPaginacion(totalPaginas, totalProductos, inicio, fin);
}

function renderizarPaginacion(totalPaginas, totalProductos, inicio, fin) {
    const contenedorPaginacion = document.getElementById('contenedor-paginacion');
    if (!contenedorPaginacion) return;

    if (totalProductos === 0 || totalPaginas <= 1) {
        contenedorPaginacion.innerHTML = '';
        return;
    }

    let html = `
        <p class="paginacion-info">Mostrando ${inicio + 1} - ${fin} de ${totalProductos} productos</p>
        <div class="paginacion-controles">
            <button type="button" class="btn-paginacion" id="btn-prev-page" ${paginaActual === 1 ? 'disabled' : ''}>
                &laquo; Anterior
            </button>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        if (
            i === 1 ||
            i === totalPaginas ||
            (i >= paginaActual - 1 && i <= paginaActual + 1)
        ) {
            html += `
                <button type="button" class="btn-paginacion btn-num-page ${i === paginaActual ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        } else if (
            (i === paginaActual - 2 && i > 1) ||
            (i === paginaActual + 2 && i < totalPaginas)
        ) {
            html += `<span class="btn-paginacion-dots">...</span>`;
        }
    }

    html += `
            <button type="button" class="btn-paginacion" id="btn-next-page" ${paginaActual === totalPaginas ? 'disabled' : ''}>
                Siguiente &raquo;
            </button>
        </div>
    `;

    contenedorPaginacion.innerHTML = html;

    const btnPrev = document.getElementById('btn-prev-page');
    if (btnPrev) {
        btnPrev.addEventListener('click', () => cambiarPagina(paginaActual - 1));
    }

    const btnNext = document.getElementById('btn-next-page');
    if (btnNext) {
        btnNext.addEventListener('click', () => cambiarPagina(paginaActual + 1));
    }

    const btnsPage = contenedorPaginacion.querySelectorAll('.btn-num-page');
    btnsPage.forEach(btn => {
        btn.addEventListener('click', function () {
            const pageNum = parseInt(this.getAttribute('data-page'), 10);
            if (pageNum) cambiarPagina(pageNum);
        });
    });
}

function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    renderizarPaginaActual();

    const seccionCatalogo = document.getElementById('catalogo-completo');
    if (seccionCatalogo) {
        seccionCatalogo.scrollIntoView({ behavior: 'smooth' });
    }
}

function generarTagsHTML(producto) {
    let tags = [];

    const esSinTacc = esAfirmativo(producto.sintacc || producto['sin tacc'] || producto.tacc);
    const esSinAzucar = esAfirmativo(producto.sinazucar || producto['sin azucar'] || producto.azucar);
    const esVegano = esAfirmativo(producto.vegano || producto.saludable);

    if (esSinTacc) {
        tags.push(`<span class="tag-badge tag-sintacc">Sin TACC</span>`);
    }

    if (esSinAzucar) {
        tags.push(`<span class="tag-badge tag-sinazucar">Sin Azúcar</span>`);
    }

    if (esVegano) {
        tags.push(`<span class="tag-badge tag-vegano">Vegano</span>`);
    }

    if (tags.length > 0) {
        return `<div class="producto-tags-container">${tags.join('')}</div>`;
    }
    return '';
}

function renderizarProductos(productos) {
    contenedor.innerHTML = '';

    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-cargando">No se encontraron productos que coincidan con los filtros seleccionados.</p>';
        return;
    }

    productos.forEach(producto => {
        const li = document.createElement('li');

        const descripcionHTML = producto.descripcion ? `<p class="producto-descripcion">${producto.descripcion}</p>` : '';
        const precioHTML = producto.precio ? `<p class="producto-precio">$ ${producto.precio}</p>` : '';
        const tagsHTML = generarTagsHTML(producto);

        const rutaImagen = producto.imagen
            ? (producto.imagen.startsWith('http') ? producto.imagen : `../images/${producto.imagen}`)
            : '../images/producto.png';

        const idParam = producto.id ? encodeURIComponent(producto.id) : encodeURIComponent(producto.nombre);

        li.innerHTML = `
            <a href="detalle-producto.html?id=${idParam}" class="producto-card">
                <div class="producto-imagen-wrapper">
                    ${tagsHTML}
                    <img src="${rutaImagen}" alt="${producto.nombre}" loading="lazy" onerror="this.onerror=null;this.src='../images/producto.png';">
                </div>
                <div class="producto-detalles">
                    <div>
                        <h3 class="producto-titulo">${producto.nombre}</h3>
                        ${descripcionHTML}
                    </div>
                    <div class="producto-footer">
                        ${precioHTML}
                        <button type="button" class="producto-btn">Ver más</button>
                    </div>
                </div>
            </a>
        `;

        contenedor.appendChild(li);
    });
}

// Esta función convierte el formato "Valores separados por comas" de Google a un formato útil
function csvToJson(csv) {
    const lineas = csv.split('\n');
    if (lineas.length === 0) return [];

    // Normalizar nombres de columnas a minúsculas y sin acentos
    const titulos = lineas[0].split(',').map(titulo => normalizarTexto(titulo));
    const resultado = [];

    for (let i = 1; i < lineas.length; i++) {
        if (!lineas[i] || lineas[i].trim() === '') continue;

        const valores = lineas[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const obj = {};

        titulos.forEach((titulo, index) => {
            let valor = valores[index] ? valores[index].replace(/(^"|"$)/g, '').trim() : '';
            obj[titulo] = valor;
        });

        resultado.push(obj);
    }
    return resultado;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarToggleFiltrosMobile);
} else {
    inicializarToggleFiltrosMobile();
}

// Ejecutar al cargar la página
cargarProductos();