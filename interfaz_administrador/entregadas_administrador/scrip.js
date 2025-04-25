function cerrarSesion() {
    window.location.href = "../index.html";
}

function toggleSubmenu(event) {
    event.preventDefault();
    const submenu = event.target.nextElementSibling;
    document.querySelectorAll(".submenu-content").forEach(el => el.classList.remove("show"));
    submenu.classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".submenu > a").forEach(menuLink => {
        menuLink.addEventListener("click", toggleSubmenu);
    });

    cargarEntregadas();
});

function cargarEntregadas() {
    fetch("http://localhost:3000/solicitudes")
        .then(res => res.json())
        .then(data => {
            const entregadas = data.filter(s => s.estado === "entregada");
            const contenedor = document.getElementById("contenedor-entregados");
            contenedor.innerHTML = '<h1 class="category-title">Historial de Entregas</h1>';

            if (entregadas.length === 0) {
                contenedor.innerHTML += "<p>No hay solicitudes entregadas.</p>";
                return;
            }

            const agrupadas = {};

            entregadas.forEach(s => {
                if (!agrupadas[s.nombre_usuario]) agrupadas[s.nombre_usuario] = [];
                agrupadas[s.nombre_usuario].push(s);
            });

            Object.entries(agrupadas).forEach(([correo, solicitudes]) => {
                const datos = solicitudes[0];
                const bloque = document.createElement("div");
                bloque.className = "category";

                bloque.innerHTML = `
                    <h2>${datos.nombres} ${datos.apellidos}</h2>
                    <p><strong>Correo:</strong> ${datos.nombre_usuario}</p>
                    <p><strong>Documento:</strong> ${datos.documento}</p>
                    <p><strong>Teléfono:</strong> ${datos.telefono}</p>
                    <hr>
                    <h3>📦 Implementos entregados:</h3>
                    <ul>
                        ${solicitudes.map(s => `
                            <li>
                                ${s.nombre_producto} (${s.cantidad})<br>
                                <small><strong>Fecha de entrega:</strong> ${
                                    s.fecha_entrega
                                        ? new Date(s.fecha_entrega).toLocaleString()
                                        : "No disponible"
                                }</small>
                            </li>
                        `).join("")}
                    </ul>
                `;
                contenedor.appendChild(bloque);
            });
        })
        .catch(err => {
            console.error("❌ Error al cargar solicitudes:", err);
            document.getElementById("contenedor-entregados").innerHTML =
                "<p>Error al cargar solicitudes entregadas.</p>";
        });
}
