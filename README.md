# 🌱 De Todo Un Poco - Almacén y Dietética

Sitio web oficial y catálogo digital interactivo de **De Todo Un Poco**, almacén natural y dietética ubicado en San Antonio de Areco, Provincia de Buenos Aires.

🌐 **Sitio Web en Vivo:** [detodounpocoareco.com.ar](https://detodounpocoareco.com.ar)

---

## 📋 Descripción del Proyecto

Este proyecto consiste en una plataforma web moderna, rápida y 100% responsiva diseñada para exhibir el catálogo completo de productos de la dietética. Permite a los clientes explorar productos, filtrar por categorías y necesidades nutricionales específicas (Sin TACC, Sin Azúcar, Vegano), buscar en tiempo real y realizar consultas o pedidos directamente a través de WhatsApp.

El catálogo utiliza **Google Sheets como CMS headless (gestor de contenidos)**, lo que permite actualizar precios, stock, descripciones e imágenes de forma instantánea sin necesidad de modificar el código fuente ni depender de un backend complejo.

---

## ✨ Características Principales

### 🛒 Catálogo Inteligente y Dinámico
- **Sincronización en Tiempo Real:** Los productos se cargan dinámicamente consumiendo una planilla de Google Sheets publicada en formato CSV vía `Fetch API`.
- **Filtros por Clasificación Nutricional:** Filtrado combinado para productos **Sin TACC (Apto Celíacos)**, **Sin Azúcar** y **Veganos**.
- **Filtros por Categoría:** Navegación por más de 10 categorías (Frutos Secos, Semillas, Harinas, Repostería, Congelados, Suplementos, Condimentos, Conservas, Dulces, Tés e Infusiones, etc.).
- **Búsqueda en Tiempo Real:** Barra de búsqueda predictiva con filtrado instantáneo por nombre y descripción.
- **Paginación Fluida:** Navegación ágil organizada en páginas de 12 productos.
- **Deep Linking (Filtros por URL):** Soporte de parámetros URL (`?categoria=...`, `?clasificacion=...`, `?busqueda=...`) para compartir enlaces directos a secciones o búsquedas específicas.

### 📱 Experiencia de Usuario y Detalle de Producto
- **Ficha de Detalle:** Vista individual con imagen en alta calidad, badges nutricionales, descripción completa, categoría y precio.
- **Integración con WhatsApp:** Botón directo en cada producto que genera un mensaje preconfigurado con el nombre del artículo para agilizar pedidos y consultas.
- **Diseño Mobile-First & Drawer:** Menú de navegación lateral deslizante y panel de filtros colapsable optimizado para pantallas táctiles con indicador de filtros activos.

### 🌓 Modo Oscuro / Claro (Dark Mode)
- Interruptor deslizante animado con iconos de Sol y Luna.
- Paleta cromática optimizada y contrastes accesibles en ambos temas.
- Persistencia de la preferencia del usuario mediante `localStorage`.

### ⚡ Rendimiento y SEO
- Carga diferida de imágenes (`loading="lazy"`) y fallbacks automáticos en caso de enlaces rotos.
- Estructura HTML5 semántica y jerarquía de encabezados optimizada.
- Metadatos configurados para visualización adecuada en dispositivos móviles.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Estructura semántica, accesible y compatible con estándares modernos.
- **CSS3:**
  - Variables CSS (Custom Properties) para temas Claro/Oscuro dinámicos.
  - Maquetación flexible con CSS Grid y Flexbox.
  - Media queries para diseño 100% adaptable a celulares, tablets y computadoras de escritorio.
  - Transiciones y micro-interacciones suaves.
- **JavaScript (Vanilla ES6+):**
  - Consumo asíncrono con `async/await` y `Fetch API`.
  - Parser personalizado de CSV a JSON (`csvToJson`).
  - Manipulación eficiente del DOM.
  - Manejo de estado de filtros, búsqueda y paginación.
  - `URLSearchParams` para navegación por parámetros.
  - `localStorage` para persistencia del tema visual.
- **Google Sheets API / CSV Export:** Base de datos liviana y autoadministrable.
- **Google Fonts:** Tipografías *Roboto*, *Roboto Slab* y *SN Pro*.
- **GitHub Pages + CNAME:** Alojamiento y despliegue continuo con dominio personalizado.

---

## 📁 Estructura del Proyecto

```text
├── index.html                  # Página principal (Home, destacados, categorías, quiénes somos)
├── CNAME                       # Configuración de dominio personalizado (detodounpocoareco.com.ar)
├── README.md                   # Documentación del proyecto
│
├── pages/
│   ├── productos.html          # Catálogo completo con buscador, filtros y paginación
│   └── detalle-producto.html   # Vista en detalle del producto seleccionado y enlace a WhatsApp
│
├── css/
│   ├── styles.css              # Variables globales, tipografías, header, footer, dark mode
│   ├── inicio.css              # Estilos exclusivos de la página de inicio
│   ├── catalogo.css            # Estilos del catálogo, filtros laterales y paginación
│   └── detalle.css             # Estilos de la página de detalle de producto
│
├── js/
│   ├── main.js                 # Lógica del catálogo (fetch CSV, búsqueda, filtros, paginación)
│   ├── inicio.js               # Lógica para renderizar productos destacados y novedades en el home
│   ├── detalle.js              # Lógica de la página de detalle y generación del link de WhatsApp
│   └── dark-mode.js            # Lógica del botón de Modo Oscuro y menú mobile (drawer)
│
└── images/                     # Logotipos, íconos de categorías y recursos visuales
```

---

## 📊 Estructura de la Planilla de Productos (Google Sheets)

Para alimentar el catálogo, la planilla de Google Sheets cuenta con las siguientes columnas:

| Columna | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `id` | Identificador único del producto | `101` |
| `nombre` | Nombre del producto | `Almendras Non Pareil 250g` |
| `categoria` | Categoría principal | `Frutos Secos` |
| `precio` | Precio actual en ARS | `3500` |
| `descripcion` | Detalle, presentación o ingredientes | `Almendras seleccionadas de primera calidad.` |
| `imagen` | Nombre de archivo local o URL externa | `almendras.jpg` o `https://...` |
| `sintacc` | Indica si es apto celíaco (`si` / `no`) | `si` |
| `sinazucar` | Indica si no contiene azúcar agregada (`si` / `no`) | `si` |
| `vegano` | Indica si es apto vegano (`si` / `no`) | `si` |
| `destacado` | Muestra el producto en la portada (`si` / `no`) | `si` |
| `nuevo` | Muestra el producto en sección novedades (`si` / `no`) | `si` |

---

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Soulzzle/De-Todo-Un-Poco.git
   ```

2. **Abrir el proyecto:**
   - Podés abrir directamente el archivo `index.html` en tu navegador favorito.
   - O utilizar una extensión de servidor local como **Live Server** en VS Code para una mejor experiencia de desarrollo.

---

## 📍 Ubicación y Contacto

- **Dirección:** Irigoyen 386, San Antonio de Areco, Buenos Aires, Argentina.
- **Ubicación en Google Maps:** [Ver en el mapa](https://maps.app.goo.gl/Je3asyAWKTwyVbgQ8)
- **WhatsApp:** Atención y pedidos directos desde la web.

---

## 📄 Licencia y Derechos

Copyright © 2026 **De Todo Un Poco**. Todos los derechos reservados.