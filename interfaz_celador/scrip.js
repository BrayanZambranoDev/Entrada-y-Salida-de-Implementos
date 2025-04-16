// Redirigir al hacer clic en las categorías
document.querySelectorAll(".category").forEach(category => {
    category.addEventListener("click", function () {
        const categoryName = this.querySelector(".category-title").textContent.trim();

        switch (categoryName) {
            case "Mercadeo":
                window.location.href = "usuario_mercadeo/index.html";
                break;
            case "Biblioteca":
                window.location.href = "usuario_biblioteca/index.html";

                break;
            case "Servicios Generales":
                window.location.href = "usuario_generales/index.html";
                break;
            default:
                console.warn("No se ha definido una redirección para esta categoría.");
        }
    });
});




function cerrarSesion() {
    // Redirigir a la página de inicio de sesión
    window.location.href = "../index.html";
}


function cerrarSesion() {
    alert('Sesión cerrada');
    // Aquí puedes redirigir al login o limpiar sesión
}

function darSalida(button) {
    const solicitud = button.closest('.request-item');
    const estadoTexto = solicitud.querySelector('.estado-texto');
    const ingresoBtn = solicitud.querySelector('.access-button');

    estadoTexto.textContent = 'por fuera';
    button.disabled = true;
    ingresoBtn.disabled = false;
}

function registrarIngreso(button) {
    const solicitud = button.closest('.request-item');
    const estadoTexto = solicitud.querySelector('.estado-texto');

    estadoTexto.textContent = 'Regresado';
    button.disabled = true;
}