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
  const params = new URLSearchParams(window.location.search);
  const usuarioParam = params.get("usuario");

  if (usuarioParam) {
    mostrarSolicitudesDeUsuario(usuarioParam);
  } else {
    mostrarTodasLasSolicitudesPendientes();
  }

  document.addEventListener("submit", function (event) {
    if (event.target.classList.contains("entrega-form")) {
      confirmarEntrega(event);
    }
  });

  document.querySelectorAll(".submenu > a").forEach(menuLink => {
    menuLink.addEventListener("click", toggleSubmenu);
  });
});

function mostrarSolicitudesDeUsuario(usuario) {
  document.getElementById("titulo-solicitud").textContent = `${usuario} ha solicitado`;

  fetch("http://localhost:3000/solicitudes")
    .then(res => res.json())
    .then(data => {
      const solicitudes = data.filter(
        item => item.nombre_usuario === usuario && item.estado === "pendiente"
      );

      const contenedor = document.getElementById("items-solicitados");
      contenedor.innerHTML = "";

      if (solicitudes.length === 0) {
        contenedor.innerHTML = "<p>No hay implementos pendientes para este usuario.</p>";
        return;
      }

      const info = solicitudes[0];
      const grupo = document.createElement("div");
      grupo.className = "card";
      grupo.innerHTML = `
        <h3>${info.nombres} ${info.apellidos}</h3>
        <p><strong>Correo:</strong> ${info.nombre_usuario}</p>
        <p><strong>Documento:</strong> ${info.documento}</p>
        <p><strong>Teléfono:</strong> ${info.telefono}</p>
        <hr>
        <h4>📦 Implementos pendientes:</h4>
        <form class="entrega-form">
          <ul>
            ${solicitudes.map(item => `
              <li>
                <label>
                  <input type="checkbox" name="item" value="${item.id}">
                  ${item.nombre_producto} (${item.cantidad}) — 
                  <em>${item.comentario || 'Sin comentario'}</em> — 
                  <small><strong>Fecha de pedido:</strong> ${new Date(item.fecha).toLocaleString()}</small>
                </label>
              </li>
            `).join("")}
          </ul>
          <button type="submit">Confirmar Entrega</button>
        </form>
      `;

      contenedor.appendChild(grupo);
    });
}

function mostrarTodasLasSolicitudesPendientes() {
  document.getElementById("titulo-solicitud").textContent = "Solicitudes Pendientes";

  fetch("http://localhost:3000/solicitudes")
    .then(res => res.json())
    .then(data => {
      const pendientes = data.filter(s => s.estado === "pendiente");
      const contenedor = document.getElementById("items-solicitados");
      contenedor.innerHTML = "";

      if (pendientes.length === 0) {
        contenedor.innerHTML = "<p>No hay solicitudes pendientes.</p>";
        return;
      }

      const agrupadas = {};

      pendientes.forEach(s => {
        if (!agrupadas[s.nombre_usuario]) agrupadas[s.nombre_usuario] = [];
        agrupadas[s.nombre_usuario].push(s);
      });

      Object.entries(agrupadas).forEach(([usuario, solicitudes]) => {
        const datos = solicitudes[0];

        const grupo = document.createElement("div");
        grupo.className = "card";
        grupo.innerHTML = `
          <h3>${datos.nombres} ${datos.apellidos}</h3>
          <p><strong>Correo:</strong> ${datos.nombre_usuario}</p>
          <p><strong>Documento:</strong> ${datos.documento}</p>
          <p><strong>Teléfono:</strong> ${datos.telefono}</p>
          <hr>
          <h4>📦 Implementos pendientes:</h4>
          <form class="entrega-form">
            <ul>
              ${solicitudes.map(item => `
                <li>
                  <label>
                    <input type="checkbox" name="item" value="${item.id}">
                    ${item.nombre_producto} (${item.cantidad}) — 
                    <em>${item.comentario || 'Sin comentario'}</em> — 
                    <small><strong>Fecha de pedido:</strong> ${new Date(item.fecha).toLocaleString()}</small>
                  </label>
                </li>
              `).join("")}
            </ul>
            <button type="submit">Confirmar Entrega</button>
          </form>
        `;

        contenedor.appendChild(grupo);
      });
    });
}

function confirmarEntrega(event) {
  event.preventDefault();

  const seleccionados = Array.from(event.target.querySelectorAll('input[name="item"]:checked')).map(
    input => parseInt(input.value)
  );

  if (seleccionados.length === 0) {
    alert("Selecciona al menos un implemento para confirmar la entrega.");
    return;
  }

  fetch("http://localhost:3000/actualizar-estado-solicitudes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: seleccionados, nuevoEstado: "entregada" })
  })
    .then(res => res.json())
    .then(() => {
      alert("✅ Entrega confirmada.");
      window.location.reload();
    })
    .catch(err => {
      console.error("Error al actualizar estado:", err);
    });
}
