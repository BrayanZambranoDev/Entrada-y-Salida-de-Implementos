
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

    // Función para regresar a la página anterior
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector('.cart-button').addEventListener('click', function() {
        window.history.back(); // Regresa a la página anterior
    });
});



document.addEventListener("DOMContentLoaded", function () {
    const cartCount = document.getElementById("cart-count");
    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    const removeFromCartButtons = document.querySelectorAll(".remove-from-cart");

    let cart = {}; // Almacena la cantidad de cada producto

    addToCartButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            const category = button.parentElement;
            const productName = category.querySelector(".category-title").innerText;

            // Aumenta la cantidad del producto en el carrito
            cart[productName] = (cart[productName] || 0) + 1;
            updateCartCount();
            updateRemoveButton(category, productName);
        });
    });

    removeFromCartButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            const category = button.parentElement;
            const productName = category.querySelector(".category-title").innerText;

            if (cart[productName] > 0) {
                cart[productName] -= 1;
                updateCartCount();
                updateRemoveButton(category, productName);
            }
        });
    });

    function updateCartCount() {
        let totalItems = Object.values(cart).reduce((acc, val) => acc + val, 0);
        cartCount.innerText = totalItems;
    }

    function updateRemoveButton(category, productName) {
        const removeButton = category.querySelector(".remove-from-cart");

        if (cart[productName] > 0) {
            removeButton.style.display = "block";
            removeButton.innerText = `Quitar (${cart[productName]})`; // Muestra la cantidad
        } else {
            removeButton.style.display = "none";
        }
    }
});

