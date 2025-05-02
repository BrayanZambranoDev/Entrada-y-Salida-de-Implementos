// archivo: interfaz_administrador/en_espera_administrador/scrip.js

function cerrarSesion() {
  window.location.href = "../index.html";
}

function toggleSubmenu(event) {
  event.preventDefault();
  const submenu = event.target.nextElementSibling;
  document
    .querySelectorAll(".submenu-content")
    .forEach(el => el.classList.remove("show"));
  submenu.classList.toggle("show");
}

function confirmarEntrega(event) {
  event.preventDefault();
  const checkboxes = Array.from(
    event.target.querySelectorAll("input[name='item']:checked")
  );
  if (!checkboxes.length) {
    return alert("❌ Selecciona al menos un implemento.");
  }
  const ids = checkboxes.map(cb => parseInt(cb.value, 10));
  fetch("http://localhost:3000/actualizar-estado-solicitudes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, nuevoEstado: "entregada" })
  })
    .then(res => res.json())
    .then(data => {
      alert("✅ " + data.mensaje);
      location.reload();
    })
    .catch(err => {
      console.error(err);
      alert("❌ Error al confirmar entrega.");
    });
}

function mostrarTodasLasSolicitudesPendientes() {
  const rol = localStorage.getItem("rol")?.trim().toLowerCase();
  document.getElementById("titulo-solicitud").textContent =
    "Solicitudes Pendientes";

  fetch("http://localhost:3000/solicitudes")
    .then(res => res.json())
    .then(data => {
      const pendientes = data.filter(s =>
        s.estado === "pendiente" &&
        typeof s.categoria === "string" &&
        s.categoria.trim().toLowerCase() === rol
      );

      const cont = document.getElementById("items-solicitados");
      cont.innerHTML = "";

      if (!pendientes.length) {
        cont.innerHTML = "<p>No hay solicitudes pendientes para tu sección.</p>";
        return;
      }

      const porUsuario = pendientes.reduce((acc, s) => {
        (acc[s.nombre_usuario] = acc[s.nombre_usuario] || []).push(s);
        return acc;
      }, {});

      Object.values(porUsuario).forEach(arr => {
        const u = arr[0];
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${u.nombres} ${u.apellidos}</h3>
          <p><strong>Correo:</strong> ${u.nombre_usuario}</p>
          <p><strong>Documento:</strong> ${u.documento}</p>
          <p><strong>Teléfono:</strong> ${u.telefono}</p>
          <hr>
          <form class="entrega-form">
            <ul>
              ${arr
                .map(item => `
                  <li>
                    <label>
                      <input type="checkbox" name="item" value="${item.id}">
                      ${item.nombre_producto} (${item.cantidad}) —
                      <em>${item.comentario || "Sin comentario"}</em>
                    </label>
                  </li>
                `)
                .join("")}
            </ul>
            <button type="submit">Confirmar Entrega</button>
          </form>
        `;
        cont.appendChild(card);
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarTodasLasSolicitudesPendientes();

  document.addEventListener("submit", event => {
    if (event.target.classList.contains("entrega-form")) {
      confirmarEntrega(event);
    }
  });

  document
    .querySelectorAll(".submenu > a")
    .forEach(link => link.addEventListener("click", toggleSubmenu));
});
