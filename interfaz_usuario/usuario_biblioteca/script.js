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
    
    // Actualizar el contador en el span
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Función para agregar un implemento al carrito
function agregarAlCarrito(implemento, cantidad, comentario) {
    // Verificar si el implemento ya está en el carrito
    const indice = carrito.findIndex(item => item.id === implemento.id);
    
    if (indice !== -1) {
        // Si ya existe, actualizar la cantidad
        carrito[indice].cantidad += cantidad;
        carrito[indice].comentario = comentario;
    } else {
        // Si no existe, agregarlo al carrito
        carrito.push({
            id: implemento.id,
            nombre: implemento.nombre,
            cantidad: cantidad,
            categoria: implemento.categoria,
            comentario: comentario,
            imagen_url: implemento.imagen_url
        });
    }
    
    // Guardar el carrito actualizado y actualizar el contador
    guardarCarritoEnStorage();
    actualizarContadorCarrito();
}

// Función para quitar un implemento del carrito
function quitarDelCarrito(implementoId) {
    carrito = carrito.filter(item => item.id !== implementoId);
    guardarCarritoEnStorage();
    actualizarContadorCarrito();
}

// Función para cargar los implementos de la categoría actual
async function cargarImplementos() {
    try {
        const res = await fetch('http://localhost:3000/implementos');
        const implementos = await res.json();
      
        const implementosContainer = document.getElementById('implementos-container');
        implementosContainer.innerHTML = '';
      
        // Determinar la categoría actual basado en la URL o en el título de la página
        let categoriaActual = document.querySelector('.logo').textContent.trim();
        
        // Filtrar implementos por categoría
        implementos
            .filter(imp => imp.categoria === 'Biblioteca')
            .forEach(implemento => {
                const tarjeta = document.createElement('div');
                tarjeta.classList.add('category');
                tarjeta.dataset.implementoId = implemento.id;
      
                const imagenUrl = implemento.imagen_url ? `http://localhost:3000${implemento.imagen_url}` : 'static/images.png';
    
                tarjeta.innerHTML = `
                    <img src="${imagenUrl}" alt="${implemento.nombre}" class="category-img">
                    <span class="category-title">${implemento.nombre}</span>
                    <p><strong>Cantidad disponible:</strong> ${implemento.cantidad}</p>
                    <label>Ingrese cantidad:</label>
                    <input type="number" class="input-qty" min="1" max="${implemento.cantidad}" value="1" placeholder="Cantidad">
                    <label>Comentario (opcional):</label>
                    <textarea class="input-comment" rows="2" placeholder="Escriba un comentario..."></textarea>
                    <button class="add-to-cart">Agregar al carrito</button>
                    <button class="remove-from-cart">Quitar</button>
                `;
      
                implementosContainer.appendChild(tarjeta);
                
                // Agregar eventos a los botones
                const addToCartBtn = tarjeta.querySelector('.add-to-cart');
                const removeFromCartBtn = tarjeta.querySelector('.remove-from-cart');
                const inputQty = tarjeta.querySelector('.input-qty');
                const inputComment = tarjeta.querySelector('.input-comment');
                
                // Evento para agregar al carrito
                addToCartBtn.addEventListener('click', () => {
                    const cantidad = parseInt(inputQty.value);
                    
                    // Validar la cantidad
                    if (isNaN(cantidad) || cantidad <= 0 || cantidad > implemento.cantidad) {
                        alert('Por favor ingrese una cantidad válida');
                        return;
                    }
                    
                    const comentario = inputComment.value.trim();
                    agregarAlCarrito(implemento, cantidad, comentario);
                    
                    // Mostrar confirmación visual
                    addToCartBtn.textContent = '¡Agregado!';
                    setTimeout(() => {
                        addToCartBtn.textContent = 'Agregar al carrito';
                    }, 1500);
                });
                
                // Evento para quitar del carrito
                removeFromCartBtn.addEventListener('click', () => {
                    quitarDelCarrito(implemento.id);
                    
                    // Mostrar confirmación visual
                    removeFromCartBtn.textContent = '¡Quitado!';
                    setTimeout(() => {
                        removeFromCartBtn.textContent = 'Quitar';
                    }, 1500);
                });
            });
    } catch (error) {
        console.error('Error al cargar los implementos:', error);
        const implementosContainer = document.getElementById('implementos-container');
        implementosContainer.innerHTML = '<p>Error al cargar los implementos. Por favor, intente más tarde.</p>';
    }
}

// Función para manejar la solicitud de préstamo
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


// Añade estas funciones al script.js de las páginas de categorías

// Función para mostrar el modal del carrito
// Modificación de la función mostrarCarrito para permitir editar comentarios
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
        contenidoCarrito += `<p>El carrito está vacío</p>`;
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
    
    // Evento para enviar la solicitud
    btnEnviarSolicitud.addEventListener('click', () => {
        enviarSolicitud();
        modalCarrito.style.display = 'none';
    });
    
    
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

// Modificar el inicializador para agregar el evento al botón del carrito
document.addEventListener('DOMContentLoaded', () => {
    // Cargar el carrito desde localStorage
    cargarCarritoDesdeStorage();
    
    // Cargar los implementos de la categoría
    cargarImplementos();
    
    // Configurar el botón de enviar solicitud
    const sendRequestBtn = document.getElementById('send-request-button');
    if (sendRequestBtn) {
        sendRequestBtn.addEventListener('click', enviarSolicitud);
    }
    
    // Configurar el botón del carrito para abrir el modal
    const cartButton = document.getElementById('cart-button');
    if (cartButton) {
        cartButton.addEventListener('click', mostrarCarrito);
    }
});