// 1. EL LINK MÁGICO DE GOOGLE SHEETS
// Pegá tu link CSV de Google Sheets acá adentro:
const urlGoogleSheet = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd9-z8x-I9S7F53ejauUthwDdnEy0wB7ei8RLRVVkyD8y1m3CWHDlBgxhURb1a3-Fde2tr-7C0Auue/pub?output=csv";

// Buscamos el contenedor donde vamos a inyectar los productos
// Asegurate de que en tu productos.html el <ul> tenga el id="contenedor-productos"
const contenedor = document.getElementById('contenedor-productos');

async function cargarProductos() {
    try {
        // Pedimos los datos a Google Sheets
        const respuesta = await fetch(urlGoogleSheet);
        const datosCSV = await respuesta.text();

        // Convertimos el texto CSV a una lista de objetos que JavaScript entienda
        const productos = csvToJson(datosCSV);

        // Limpiamos el contenedor por si había algo antes (como texto de "Cargando...")
        if (contenedor) {
            contenedor.innerHTML = '';
        } else {
            console.error("No se encontró el ul con id 'contenedor-productos'");
            return;
        }

        // Recorremos cada producto que vino del Excel
        productos.forEach(producto => {

            // LÓGICA DE NEGOCIO: Si en el Excel dice "No" en disponible, saltamos al siguiente
            if (producto.disponible && producto.disponible.toLowerCase().trim() === "no") {
                return;
            }

            // Creamos un nuevo elemento <li> para la grilla
            const li = document.createElement('li');

            // Procesamos campos opcionales del Excel
            const categoriaBadge = producto.categoria ? `<span class="producto-badge">${producto.categoria}</span>` : '';
            const descripcionHTML = producto.descripcion ? `<p class="producto-descripcion">${producto.descripcion}</p>` : '';
            const precioHTML = producto.precio ? `<p class="producto-precio">$ ${producto.precio}</p>` : '';

            // Ruta de la imagen (soporta tanto imágenes locales en ../images/ como URLs completas)
            const rutaImagen = producto.imagen
                ? (producto.imagen.startsWith('http') ? producto.imagen : `../images/${producto.imagen}`)
                : '../images/producto.png';

            // Armamos la tarjeta limpia usando las clases definidas en styles.css
            li.innerHTML = `
                <a href="#" class="producto-card">
                    <div class="producto-imagen-wrapper">
                        ${categoriaBadge}
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

            // Lo metemos en la pantalla
            contenedor.appendChild(li);
        });

    } catch (error) {
        console.error("Error al cargar la planilla de Google Sheets:", error);
        if (contenedor) contenedor.innerHTML = '<p>Error al cargar los productos. Intente nuevamente más tarde.</p>';
    }
}

// Esta función convierte el formato "Valores separados por comas" de Google a un formato útil
function csvToJson(csv) {
    const lineas = csv.split('\n'); // Corta el archivo por renglones
    // Agarramos la fila 1 (los títulos) y le quitamos los espacios en blanco
    const titulos = lineas[0].split(',').map(titulo => titulo.trim());
    const resultado = [];

    // Recorremos desde la fila 2 en adelante
    for (let i = 1; i < lineas.length; i++) {
        if (!lineas[i] || lineas[i].trim() === '') continue; // Salta renglones vacíos

        // Expresión regular para separar por comas pero ignorar comas dentro de textos
        const valores = lineas[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const obj = {};

        // Emparejamos el título de la columna con el valor de la fila
        titulos.forEach((titulo, index) => {
            // Limpiamos las comillas extra y espacios que a veces agrega el CSV
            let valor = valores[index] ? valores[index].replace(/(^"|"$)/g, '').trim() : '';
            obj[titulo] = valor;
        });

        resultado.push(obj);
    }
    return resultado;
}

// Le decimos a la página que ejecute todo esto apenas cargue
cargarProductos();