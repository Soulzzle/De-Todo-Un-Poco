(function () {
    const CLAVE_STORAGE = 'dtup_tema_preferido';

    function aplicarTema(tema) {
        const esOscuro = tema === 'dark';

        if (esOscuro) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Actualizar el texto de los botones de Dark Mode en la página
        const botonesDarkMode = document.querySelectorAll('.btn-dark-mode');
        botonesDarkMode.forEach(btn => {
            btn.textContent = esOscuro ? 'Light mode' : 'Dark mode';
        });
    }

    function inicializarTema() {
        // Tema por defecto: 'light'
        const temaGuardado = localStorage.getItem(CLAVE_STORAGE) || 'light';
        aplicarTema(temaGuardado);

        const botonesDarkMode = document.querySelectorAll('.btn-dark-mode');
        botonesDarkMode.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const esOscuroActualmente = document.body.classList.contains('dark-mode');
                const nuevoTema = esOscuroActualmente ? 'light' : 'dark';
                localStorage.setItem(CLAVE_STORAGE, nuevoTema);
                aplicarTema(nuevoTema);
            });
        });
    }

    // Ejecutar al cargar la estructura del DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarTema);
    } else {
        inicializarTema();
    }
})();
