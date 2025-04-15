document.addEventListener('DOMContentLoaded', () => {
    const categories = document.querySelectorAll('.category');
    const cartCounter = document.querySelector('.cart-icon span');
    let totalItems = 0;
  
    categories.forEach(category => {
      const addBtn = category.querySelector('.add-to-cart');
      const removeBtn = category.querySelector('.remove-from-cart');
      const quantityInput = category.querySelector('input[type="number"]');
      const commentInput = category.querySelector('textarea');
  
      // Agregar al carrito
      addBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
  
        // Validar que la cantidad sea mayor que 0 y no NaN
        if (isNaN(quantity) || quantity <= 0) {
          alert('Por favor, ingrese una cantidad válida.');
          return;
        }
  
        // Guardar la cantidad en el botón de quitar
        removeBtn.dataset.quantity = quantity;
  
        // Actualizar el total
        totalItems += quantity;
        cartCounter.textContent = totalItems;
  
        // Mostrar botón de quitar y desactivar agregar
        removeBtn.style.display = 'block';
        addBtn.disabled = true;
      });
  
      // Quitar del carrito
      removeBtn.addEventListener('click', () => {
        const quantity = parseInt(removeBtn.dataset.quantity);
  
        // Asegurar que la cantidad guardada sea válida
        if (!isNaN(quantity)) {
          totalItems -= quantity;
          if (totalItems < 0) totalItems = 0; // Seguridad
          cartCounter.textContent = totalItems;
        }
  
        // Ocultar botón de quitar y reactivar agregar
        removeBtn.style.display = 'none';
        addBtn.disabled = false;
  
        // Limpiar inputs
        quantityInput.value = '';
        commentInput.value = '';
      });
    });
  });
  