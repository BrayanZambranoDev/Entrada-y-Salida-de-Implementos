function cerrarSesion() {
    // Limpiar datos de sesión
    localStorage.removeItem('correo');
    localStorage.removeItem('rol');
    window.location.href = "../index.html";
}

function toggleSubmenu(event) {
    event.preventDefault();
    const submenu = event.target.nextElementSibling;
    document.querySelectorAll(".submenu-content").forEach(el => el.classList.remove("show"));
    submenu.classList.toggle("show");
}

function accederSolicitud(producto, usuario) {
    window.location.href = `en_espera_administrador/index.html?producto=${encodeURIComponent(producto)}&usuario=${encodeURIComponent(usuario)}`;
}

function cargarSolicitudes() {
    // Obtener correo del administrador del localStorage
    const adminCorreo = localStorage.getItem('correo');
    const adminRol = localStorage.getItem('rol');
    
    if (!adminCorreo) {
        alert('No hay sesión activa. Redirigiendo al inicio...');
        window.location.href = "../index.html";
        return;
    }
    
    // Actualizar información del administrador en la interfaz si hay un elemento para ello
    const adminInfoElement = document.getElementById('admin-info');
    if (adminInfoElement) {
        adminInfoElement.textContent = `Administrador: ${adminCorreo} (${adminRol})`;
    }
    
    // Mostrar indicador de carga
    const contenedor = document.getElementById("contenedor-solicitudes");
    contenedor.innerHTML = "<h2>Cargando solicitudes...</h2>";
    
    // Realizar la petición al endpoint modificado para filtrar por rol
    fetch(`http://localhost:3000/solicitudes?correo=${adminCorreo}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            contenedor.innerHTML = `<h2>Solicitudes Pendientes - Departamento: ${adminRol}</h2>`;

            const pendientes = data.filter(s => s.estado === "pendiente");

            if (pendientes.length === 0) {
                contenedor.innerHTML += `<p>No hay solicitudes pendientes para el departamento de ${adminRol}.</p>`;
                return;
            }

            const agrupadas = {};
            pendientes.forEach(s => {
                if (!agrupadas[s.nombre_usuario]) {
                    agrupadas[s.nombre_usuario] = {
                        usuario: s,
                        productos: []
                    };
                }
                agrupadas[s.nombre_usuario].productos.push(s);
            });

            Object.values(agrupadas).forEach(({ usuario, productos }) => {
                const item = document.createElement("div");
                item.className = "card";

                item.innerHTML = `
                    <h3><strong>${usuario.nombres} ${usuario.apellidos}</strong></h3>
                    <p><strong>📧 Correo:</strong> ${usuario.nombre_usuario}</p>
                    <p><strong>🆔 Documento:</strong> ${usuario.documento}</p>
                    <p><strong>📞 Teléfono:</strong> ${usuario.telefono}</p>
                    <hr>
                    <h4>🧾 Productos solicitados:</h4>
                    <ul>
                        ${productos.map(p => `
                            <li>
                                <strong>${p.nombre_producto}</strong> (${p.cantidad})<br>
                                <em>Comentario:</em> ${p.comentario || 'Sin comentario'}<br>
                                <em>Fecha de pedido:</em> ${new Date(p.fecha).toLocaleString()}
                            </li>
                        `).join("")}
                    </ul>
                    <div class="request-actions">
                        <button class="access-button" onclick="accederSolicitud('${productos[0].nombre_producto}', '${usuario.nombre_usuario}')">Verificar</button>
                    </div>
                `;

                contenedor.appendChild(item);
            });
        })
        .catch(err => {
            console.error("❌ Error al cargar solicitudes:", err);
            contenedor.innerHTML = "<h2>Solicitudes Pendientes</h2>";
            contenedor.innerHTML += `<p>Error al cargar solicitudes: ${err.message}</p>`;
        });
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".submenu > a").forEach(menuLink => {
        menuLink.addEventListener("click", toggleSubmenu);
    });

    // Verificar si hay sesión de admin y cargar las solicitudes
    const adminCorreo = localStorage.getItem('correo');
    const adminRol = localStorage.getItem('rol');
    
    if (!adminCorreo || !adminRol) {
        alert('No hay sesión activa o no tienes privilegios de administrador');
        window.location.href = "../index.html";
        return;
    }
    
    // Si tiene los permisos, cargar las solicitudes
    cargarSolicitudes();
});