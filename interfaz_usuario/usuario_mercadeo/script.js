async function cargarImplementos() {
    const res = await fetch('http://localhost:3000/implementos');
    const implementos = await res.json();
  
    const implementosContainer = document.getElementById('implementos-container');
    implementosContainer.innerHTML = '';
  
    implementos
        .filter(imp => imp.categoria === 'Mercadeo')  // Filtra los implementos por categoría 'Mercadeo'
        .forEach(implemento => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('category');
  
            // Aquí usamos la URL dinámica de la imagen
            const imagenUrl = implemento.imagen_url ? `http://localhost:3000${implemento.imagen_url}` : 'static/images.png'; // Imagen por defecto si no existe imagen

            tarjeta.innerHTML = `
                <img src="${imagenUrl}" alt="${implemento.nombre}" class="category-img">
                <span class="category-title">${implemento.nombre}</span>
                <p><strong>Cantidad disponible:</strong> ${implemento.cantidad}</p> <!-- Mostrar la cantidad disponible -->
                <label>Ingrese cantidad:</label>
                <input type="number" class="input-qty" min="1" max="${implemento.cantidad}" placeholder="Cantidad">
                <label>Comentario (opcional):</label>
                <textarea class="input-comment" rows="2" placeholder="Escriba un comentario..."></textarea>
                <button class="add-to-cart">Agregar al carrito</button>
                <button class="remove-from-cart">Quitar</button>
            `;
  
            implementosContainer.appendChild(tarjeta);
        });
}
  
cargarImplementos();
