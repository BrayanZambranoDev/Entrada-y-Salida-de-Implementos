// Estructura para almacenar los implementos en el carrito
let carrito = [];

// Función para cargar el carrito desde localStorage
function cargarCarritoDesdeStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarContadorCarrito();
    }
}

// Función para guardar el carrito en localStorage
function guardarCarritoEnStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Función para actualizar el contador del carrito
function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    // Actualizar el contador en el botón de carrito de la página principal
    const cartButton = document.querySelector('.cart-button');
    if (cartButton) {
        cartButton.textContent = `🛒: ${totalItems}`;
    }
}

// Función para mostrar el modal del carrito
function mostrarCarrito() {
    // Crear el modal si no existe
    let modalCarrito = document.getElementById('modal-carrito');
    
    if (!modalCarrito) {
        modalCarrito = document.createElement('div');
        modalCarrito.id = 'modal-carrito';
        modalCarrito.className = 'modal';
        document.body.appendChild(modalCarrito);
    }
    
    // Contenido del modal
    let contenidoCarrito = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Mi Carrito</h2>
            <div class="cart-items">
    `;
    
    if (carrito.length === 0) {
        contenidoCarrito += '<p>El carrito está vacío</p>';
    } else {
        contenidoCarrito += `
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Cantidad</th>
                        <th>Comentario</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        carrito.forEach((item, index) => {
            const imagenUrl = item.imagen_url ? `http://localhost:3000${item.imagen_url}` : 'static/images.png';
            
            contenidoCarrito += `
                <tr>
                    <td><img src="${imagenUrl}" alt="${item.nombre}" class="cart-item-img"></td>
                    <td>${item.nombre}</td>
                    <td>${item.categoria}</td>
                    <td>
                        <input type="number" min="1" value="${item.cantidad}" class="cart-item-qty" data-index="${index}">
                    </td>
                    <td>
                        <textarea class="cart-item-comment" data-index="${index}" rows="2">${item.comentario || ''}</textarea>
                    </td>
                    <td>
                        <button class="btn-eliminar" data-index="${index}">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        
        contenidoCarrito += `
                </tbody>
            </table>
            <div class="cart-actions">
                <button id="btn-vaciar-carrito">Vaciar carrito</button>
                <button id="btn-cerrar-carrito">Cerrar</button>
                <button id="btn-guardar-cambios">Guardar cambios</button>
                <button id="btn-enviar-solicitud-modal">Enviar solicitud</button>
            </div>
        `;
    }
    
    contenidoCarrito += `
            </div>
        </div>
    `;
    
    modalCarrito.innerHTML = contenidoCarrito;
    modalCarrito.style.display = 'block';
    
    // Agregar eventos a los botones
    const btnCerrar = modalCarrito.querySelector('.close-modal');
    const btnCerrarCarrito = modalCarrito.querySelector('#btn-cerrar-carrito');
    const btnVaciarCarrito = modalCarrito.querySelector('#btn-vaciar-carrito');
    const btnGuardarCambios = modalCarrito.querySelector('#btn-guardar-cambios');
    const btnEnviarSolicitud = modalCarrito.querySelector('#btn-enviar-solicitud-modal');
    const btnEliminar = modalCarrito.querySelectorAll('.btn-eliminar');
    const inputCantidad = modalCarrito.querySelectorAll('.cart-item-qty');
    const textareaComentarios = modalCarrito.querySelectorAll('.cart-item-comment');
    
    // Evento para cerrar el modal
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            modalCarrito.style.display = 'none';
        });
    }
    
    // Evento para cerrar el modal con botón
    if (btnCerrarCarrito) {
        btnCerrarCarrito.addEventListener('click', () => {
            modalCarrito.style.display = 'none';
        });
    }
    
    // Evento para guardar cambios
    if (btnGuardarCambios) {
        btnGuardarCambios.addEventListener('click', () => {
            // Guardar todos los cambios realizados en el carrito
            inputCantidad.forEach(input => {
                const index = parseInt(input.dataset.index);
                const cantidad = parseInt(input.value);
                
                if (!isNaN(cantidad) && cantidad > 0) {
                    carrito[index].cantidad = cantidad;
                }
            });
            
            textareaComentarios.forEach(textarea => {
                const index = parseInt(textarea.dataset.index);
                const comentario = textarea.value.trim();
                carrito[index].comentario = comentario;
            });
            
            guardarCarritoEnStorage();
            actualizarContadorCarrito();
            
            // Mostrar mensaje de confirmación
            alert('Cambios guardados correctamente');
        });
    }
    
    // Evento para vaciar el carrito
    if (btnVaciarCarrito) {
        btnVaciarCarrito.addEventListener('click', () => {
            if (confirm('¿Está seguro que desea vaciar el carrito?')) {
                vaciarCarrito();
                mostrarCarrito(); // Actualizar la vista del carrito
            }
        });
    }
    
    // Evento para enviar la solicitud desde el modal
    if (btnEnviarSolicitud) {
        btnEnviarSolicitud.addEventListener('click', () => {
            enviarSolicitud();
        });
    }
    
    // Eventos para los botones de eliminar
    btnEliminar.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            if (confirm(`¿Está seguro que desea eliminar ${carrito[index].nombre} del carrito?`)) {
                eliminarDelCarrito(index);
                mostrarCarrito(); // Actualizar la vista del carrito
            }
        });
    });
    
    // Cerrar el modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === modalCarrito) {
            modalCarrito.style.display = 'none';
        }
    });
}

// Función para vaciar el carrito
function vaciarCarrito() {
    carrito = [];
    guardarCarritoEnStorage();
    actualizarContadorCarrito();
}

// Función para eliminar un item del carrito por índice
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarritoEnStorage();
    actualizarContadorCarrito();
}

// Función para actualizar la cantidad de un item en el carrito
function actualizarCantidadCarrito(index, cantidad) {
    if (index >= 0 && index < carrito.length) {
        carrito[index].cantidad = cantidad;
        guardarCarritoEnStorage();
    }
}

// Función para enviar solicitud (versión mejorada)
async function enviarSolicitud() {
    if (carrito.length === 0) {
        alert('El carrito está vacío. Agregue implementos antes de enviar la solicitud.');
        return;
    }

    if (!confirm('¿Está seguro que desea enviar la solicitud?')) {
        return;
    }

    try {
        const correo = localStorage.getItem("correo") || "anónimo";

        // Formateamos los datos para que coincidan con la base de datos
        const datos = carrito.map(item => ({
            usuario: correo,
            nombre: item.nombre,
            cantidad: item.cantidad,
            comentario: item.comentario || ''
        }));

        const response = await fetch('http://localhost:3000/guardar-solicitud', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: datos })
        });

        if (response.ok) {
            alert('✅ Solicitud enviada correctamente');
            carrito = [];
            guardarCarritoEnStorage();
            actualizarContadorCarrito();
        } else {
            alert('❌ Error al enviar la solicitud');
        }
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        alert('❌ Error de conexión: ' + error.message);
    }
}


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
    // Limpiar el carrito al cerrar sesión
    localStorage.removeItem('carrito');
    // Redirigir a la página de inicio de sesión
    window.location.href = "../index.html";
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', () => {
    // Cargar el carrito desde localStorage
    cargarCarritoDesdeStorage();
    
    // Añadir evento al botón del carrito en la página principal
    const cartButton = document.querySelector('.cart-button');
    if (cartButton) {
        cartButton.addEventListener('click', mostrarCarrito);
    }
    
    // Añadir evento al botón de enviar solicitud PRINCIPAL
    const sendRequestBtn = document.getElementById('send-request-button');
    if (sendRequestBtn) {
        sendRequestBtn.addEventListener('click', enviarSolicitud);
    }
});