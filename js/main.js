const contenedor = document.getElementById('contenedor-productos');

async function cargarProductos() {
    try {
        const respuesta = await fetch('productos.json');
        const productos = await respuesta.json();
        productos.forEach(producto => {
            const elemento = document.createElement('li');
            elemento.innerHTML = `
                <a href="#" class="producto">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                </a>
            `;
            contenedor.appendChild(elemento);
        });
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

cargarProductos();