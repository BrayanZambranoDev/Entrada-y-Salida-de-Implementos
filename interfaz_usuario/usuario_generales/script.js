
        // Para cambiar las imágenes cuando se suban nuevos archivos
        document.querySelectorAll('input[type="file"]').forEach(input => {
            input.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        document.getElementById(event.target.id.replace('-upload', '-img')).src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        });

        // Función para agregar al carrito
        let cartCount = 0;
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                cartCount++;
                document.querySelector('.cart-button').textContent = `+ (${cartCount})`;
            });
        });
    // Función para regresar a la página anterior
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector('.cart-button').addEventListener('click', function() {
        window.history.back(); // Regresa a la página anterior
    });
});