
function cerrarSesion() {
    // Redirigir a la página de inicio de sesión
    window.location.href = "../index.html";
}

// Función para mostrar/ocultar submenús de forma independiente
function toggleSubmenu(event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del enlace
    var submenu = event.target.nextElementSibling;

    if (submenu.classList.contains("show")) {
        submenu.classList.remove("show");
    } else {
        // Ocultar cualquier otro submenú abierto
        document.querySelectorAll(".submenu-content").forEach(function (el) {
            el.classList.remove("show");
        });
        submenu.classList.add("show");
    }
}

// Agregar eventos a los enlaces de los submenús
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".submenu > a").forEach(function (menuLink) {
        menuLink.addEventListener("click", toggleSubmenu);
    });
});


// Función para aprobar solicitud
function aprobarSolicitud(producto, usuario) {
    // Crear un nuevo elemento para el submenú de solicitudes aprobadas
    const aprobadasList = document.querySelector('.submenu-content.aprobadas');
    const nuevaSolicitud = document.createElement('a');
    nuevaSolicitud.href = '#';
    nuevaSolicitud.textContent = `${usuario} ha solicitado ${producto}`;

    // Añadirlo al submenú de solicitudes aprobadas
    aprobadasList.appendChild(nuevaSolicitud);

    // Mostrar el submenú de aprobadas si no está visible
    if (!aprobadasList.classList.contains('show-aprobadas')) {
        aprobadasList.classList.add('show-aprobadas');
    }

    // Opcional: Eliminar la solicitud aprobada del recuadro de solicitudes pendientes
    const solicitud = event.target.closest('.request-item');
    solicitud.remove();
}

    document.getElementById("entrega-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Evita que la página se recargue
        alert("Entrega confirmada.");
    });
