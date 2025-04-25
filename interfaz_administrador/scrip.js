function cerrarSesion() {
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
    fetch("http://localhost:3000/solicitudes")
        .then(res => res.json())
        .then(data => {
            const contenedor = document.getElementById("contenedor-solicitudes");
            contenedor.innerHTML = "<h2>Solicitudes Pendientes</h2>";

            const pendientes = data.filter(s => s.estado === "pendiente");

            if (pendientes.length === 0) {
                contenedor.innerHTML += "<p>No hay solicitudes pendientes.</p>";
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
            document.getElementById("contenedor-solicitudes").innerHTML += "<p>Error al cargar solicitudes.</p>";
        });
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".submenu > a").forEach(menuLink => {
        menuLink.addEventListener("click", toggleSubmenu);
    });

    cargarSolicitudes();
});
