/* ==========================================
   LÓGICA DEL MODO OSCURO (DARK MODE TOGGLE SWITCH)
   ========================================== */
(function () {
    const CLAVE_STORAGE = 'dtup_tema_preferido';

    // Estructura HTML del interruptor horizontal con el icono dentro de la bola deslizante
    const HTML_INTERRUPTOR = `
      <span class="toggle-track">
        <span class="toggle-thumb">
          <svg class="icon-sun" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg class="icon-moon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
          </svg>
        </span>
      </span>
    `;

    function aplicarTema(tema) {
        const esOscuro = tema === 'dark';

        if (esOscuro) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        const botonesDarkMode = document.querySelectorAll('.btn-dark-mode');
        botonesDarkMode.forEach(btn => {
            btn.setAttribute('aria-label', esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
            btn.setAttribute('title', esOscuro ? 'Modo claro' : 'Modo oscuro');
        });
    }

    function inicializarTema() {
        const botonesDarkMode = document.querySelectorAll('.btn-dark-mode');
        botonesDarkMode.forEach(btn => {
            btn.innerHTML = HTML_INTERRUPTOR;
            btn.setAttribute('type', 'button');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const esOscuroActualmente = document.body.classList.contains('dark-mode');
                const nuevoTema = esOscuroActualmente ? 'light' : 'dark';
                localStorage.setItem(CLAVE_STORAGE, nuevoTema);
                aplicarTema(nuevoTema);
            });
        });

        const temaGuardado = localStorage.getItem(CLAVE_STORAGE) || 'light';
        aplicarTema(temaGuardado);
    }

    function inicializarMenuMobile() {
        const btnOpen = document.getElementById('btn-hamburguesa');
        const btnClose = document.getElementById('btn-cerrar-drawer');
        const menu = document.getElementById('menu-navegacion');
        const overlay = document.getElementById('menu-overlay');

        if (!btnOpen || !menu) return;

        function abrirMenu() {
            menu.classList.add('open');
            if (overlay) overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function cerrarMenu() {
            menu.classList.remove('open');
            if (overlay) overlay.classList.remove('open');
            document.body.style.overflow = '';
        }

        btnOpen.addEventListener('click', abrirMenu);
        if (btnClose) btnClose.addEventListener('click', cerrarMenu);
        if (overlay) overlay.addEventListener('click', cerrarMenu);

        const enlacesMenu = menu.querySelectorAll('a');
        enlacesMenu.forEach(enlace => {
            enlace.addEventListener('click', () => {
                const href = enlace.getAttribute('href') || '';
                if (href.startsWith('#')) {
                    cerrarMenu();
                } else {
                    setTimeout(cerrarMenu, 150);
                }
            });
        });
    }

    function inicializarTodo() {
        inicializarTema();
        inicializarMenuMobile();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarTodo);
    } else {
        inicializarTodo();
    }
})();
