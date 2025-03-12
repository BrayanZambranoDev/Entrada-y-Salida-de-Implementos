// Redirigir al hacer clic en las categorías
document.querySelectorAll(".category").forEach(category => {
    category.addEventListener("click", function () {
        const categoryName = this.querySelector(".category-title").textContent.trim();

        switch (categoryName) {
            case "Mercadeo":
                window.location.href = "../usuario_mercadeo/index.html";
                break;
            case "Biblioteca":
                window.location.href = "../usuario_biblioteca/index.html";

                break;
            case "Servicios Generales":
                window.location.href = "../usuario_servicios/index.html";
                break;
            default:
                console.warn("No se ha definido una redirección para esta categoría.");
        }
    });
});
