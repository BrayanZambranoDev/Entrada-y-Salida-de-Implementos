
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
