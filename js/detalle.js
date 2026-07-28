// Link CSV de Google Sheets:
const urlGoogleSheet = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd9-z8x-I9S7F53ejauUthwDdnEy0wB7ei8RLRVVkyD8y1m3CWHDlBgxhURb1a3-Fde2tr-7C0Auue/pub?output=csv";

// Número de teléfono de WhatsApp (código de país + característica + número sin + ni espacios)
// Ejemplo para Argentina (+54 9 11 1234 5678 -> "5491112345678")
const numeroWhatsApp = "5492478402392";

const contenedorDetalle = document.getElementById('contenedor-detalle-producto');

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

    return tags.length > 0 ? `<div class="producto-tags-container">${tags.join('')}</div>` : '';
}

async function cargarDetalleProducto() {
    if (!contenedorDetalle) return;

    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id') || params.get('nombre');

    if (!idParam) {
        contenedorDetalle.innerHTML = '<p class="mensaje-cargando">No se especificó ningún producto.</p>';
        return;
    }

    try {
        const respuesta = await fetch(urlGoogleSheet);
        const datosCSV = await respuesta.text();
        const productos = csvToJson(datosCSV);

        const idBuscado = decodeURIComponent(idParam);
        const productoEncontrado = productos.find(p => {
            if (p.id && String(p.id).trim() === idBuscado.trim()) return true;
            return normalizarTexto(p.nombre) === normalizarTexto(idBuscado);
        });

        if (!productoEncontrado) {
            contenedorDetalle.innerHTML = '<p class="mensaje-cargando">Producto no encontrado.</p>';
            return;
        }

        renderizarDetalle(productoEncontrado);
    } catch (error) {
        console.error("Error al cargar el detalle del producto:", error);
        contenedorDetalle.innerHTML = '<p class="mensaje-cargando">Error al cargar la información del producto.</p>';
    }
}

function renderizarDetalle(producto) {
    document.title = `${producto.nombre || 'Producto'} - De Todo Un Poco`;

    const rutaImagen = producto.imagen
        ? (producto.imagen.startsWith('http') ? producto.imagen : `../images/${producto.imagen}`)
        : '../images/producto.png';

    const tagsHTML = generarTagsHTML(producto);
    const descripcion = producto.descripcion || 'Sin descripción disponible.';
    const precio = producto.precio ? `$ ${producto.precio}` : 'Consultar precio';
    const categoria = producto.categoria ? `<span class="categoria-badge">${producto.categoria}</span>` : '';
    const marca = producto.marca ? `<p class="producto-marca"><strong>Marca:</strong> ${producto.marca}</p>` : '';

    const mensajeWS = encodeURIComponent(`Hola! Quisiera consultar por el producto "${producto.nombre}" que vi en su página web.`);

    contenedorDetalle.innerHTML = `
        <div class="card-detalle">
            <div class="detalle-imagen-wrapper">
                ${tagsHTML}
                <img src="${rutaImagen}" alt="${producto.nombre}" onerror="this.onerror=null;this.src='../images/producto.png';">
            </div>
            <div class="detalle-info">
                ${categoria}
                <h1 class="detalle-titulo">${producto.nombre}</h1>
                ${marca}
                <p class="detalle-precio">${precio}</p>
                <div class="detalle-descripcion">
                    <h3>Descripción</h3>
                    <p>${descripcion}</p>
                </div>
                <div class="detalle-acciones">
                    <a href="https://wa.me/${numeroWhatsApp}?text=${mensajeWS}" target="_blank" class="btn-consultar-ws">
                        <span>Consultar por WhatsApp</span>
                        <img src="../images/whap-contacto.png" alt="WhatsApp" class="icono-ws">
                    </a>
                </div>
            </div>
        </div>
    `;
}

cargarDetalleProducto();
