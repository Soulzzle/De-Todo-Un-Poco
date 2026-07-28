// Link CSV de Google Sheets:
const urlGoogleSheet = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd9-z8x-I9S7F53ejauUthwDdnEy0wB7ei8RLRVVkyD8y1m3CWHDlBgxhURb1a3-Fde2tr-7C0Auue/pub?output=csv";

const contenedorDestacados = document.getElementById('contenedor-destacados');
const contenedorNuevos = document.getElementById('contenedor-nuevos');

function normalizarTexto(texto) {
    return (texto || '')
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function esAfirmativo(val) {
    if (!val) return false;
    const v = normalizarTexto(val);
    return v === 'si' || v === 'true' || v === '1' || v === 's';
}

function csvToJson(csv) {
    const lineas = csv.split('\n');
    if (lineas.length === 0) return [];

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

function generarTagsHTML(producto) {
    let tags = [];

    const esSinTacc = esAfirmativo(producto.sintacc || producto['sin tacc'] || producto.tacc);
    const esSinAzucar = esAfirmativo(producto.sinazucar || producto['sin azucar'] || producto.azucar);
    const esVegano = esAfirmativo(producto.vegano || producto.saludable);

    if (esSinTacc) tags.push(`<span class="tag-badge tag-sintacc">Sin TACC</span>`);
    if (esSinAzucar) tags.push(`<span class="tag-badge tag-sinazucar">Sin Azúcar</span>`);
    if (esVegano) tags.push(`<span class="tag-badge tag-vegano">Vegano</span>`);

    if (tags.length > 0) {
        return `<div class="producto-tags-container">${tags.join('')}</div>`;
    }
    return '';
}

function renderizarProductos(contenedor, productos) {
    if (!contenedor) return;
    contenedor.innerHTML = '';

    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-cargando">No hay productos disponibles.</p>';
        return;
    }

    productos.forEach(producto => {
        const li = document.createElement('li');

        const descripcionHTML = producto.descripcion ? `<p class="producto-descripcion">${producto.descripcion}</p>` : '';
        const precioHTML = producto.precio ? `<p class="producto-precio">$ ${producto.precio}</p>` : '';
        const tagsHTML = generarTagsHTML(producto);

        const rutaImagen = producto.imagen
            ? (producto.imagen.startsWith('http') ? producto.imagen : `images/${producto.imagen}`)
            : 'images/producto.png';

        const idParam = producto.id ? encodeURIComponent(producto.id) : encodeURIComponent(producto.nombre);

        li.innerHTML = `
            <a href="pages/detalle-producto.html?id=${idParam}" class="producto-card">
                <div class="producto-imagen-wrapper">
                    ${tagsHTML}
                    <img src="${rutaImagen}" alt="${producto.nombre}" loading="lazy" onerror="this.onerror=null;this.src='images/producto.png';">
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

function obtenerDestacadosRandom(productos, cantidad = 10) {
    const copia = [...productos];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia.slice(0, cantidad);
}

async function cargarProductosInicio() {
    if (contenedorDestacados) {
        contenedorDestacados.innerHTML = '<p class="mensaje-cargando">Cargando productos destacados...</p>';
    }
    if (contenedorNuevos) {
        contenedorNuevos.innerHTML = '<p class="mensaje-cargando">Cargando productos nuevos...</p>';
    }

    try {
        const respuesta = await fetch(urlGoogleSheet);
        const datosCSV = await respuesta.text();
        const todosLosProductos = csvToJson(datosCSV);

        // Filtrar productos válidos (que tengan nombre y disponible !== 'no')
        const productosValidos = todosLosProductos.filter(p => {
            if (!p.nombre || p.nombre.trim() === '') return false;
            if (p.disponible && normalizarTexto(p.disponible) === 'no') return false;
            return true;
        });

        // 1. Productos Nuevos: siempre los últimos 5 productos del Excel
        const productosNuevos = productosValidos.slice(-5).reverse();
        renderizarProductos(contenedorNuevos, productosNuevos);

        // 2. Productos Destacados: 10 productos randoms del Excel
        const productosDestacados = obtenerDestacadosRandom(productosValidos, 10);
        renderizarProductos(contenedorDestacados, productosDestacados);

    } catch (error) {
        console.error("Error al cargar productos para la página de inicio:", error);
        if (contenedorDestacados) {
            contenedorDestacados.innerHTML = '<p class="mensaje-cargando">Error al cargar productos destacados.</p>';
        }
        if (contenedorNuevos) {
            contenedorNuevos.innerHTML = '<p class="mensaje-cargando">Error al cargar productos nuevos.</p>';
        }
    }
}

cargarProductosInicio();
