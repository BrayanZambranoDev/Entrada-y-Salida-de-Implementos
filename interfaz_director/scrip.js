// scrip.js (Panel Director)

// 1) Cerrar sesión y limpiar todo
function cerrarSesion() {
  localStorage.removeItem("correo");
  localStorage.removeItem("rol");
  localStorage.removeItem("id_token");
  window.location.href = "../index.html";
}

// 2) Obtiene headers con el token
function authHeaders() {
  const token = localStorage.getItem("id_token");
  return token
    ? {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    : { "Content-Type": "application/json" };
}

// 3) Cargar solicitudes pendientes
async function cargarSolicitudesDirector() {
  const cont = document.getElementById("director-list");
  cont.innerHTML = "<p>Cargando…</p>";

  try {
    const res = await fetch("http://localhost:3000/solicitudes/director", {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    cont.innerHTML = "";
    if (!data.length) {
      cont.innerHTML = "<p>No hay solicitudes por aprobar.</p>";
      return;
    }

    data.forEach(item => {
      const card = document.createElement("div");
      card.className = "card mb-3";
      card.innerHTML = `
        <div class="card-header">
          Grupo #${item.grupo_id} — 
          <small>${new Date(item.fecha_pedido).toLocaleString()}</small>
        </div>
        <div class="card-body">
          <p><strong>Producto:</strong> ${item.producto} (${item.cantidad})</p>
          <p><strong>Comentario:</strong> ${item.comentario || '—'}</p>
          <p><strong>Usuario:</strong> ${item.solicitante}</p>
          <button class="btn btn-success" onclick="decidirSolicitud(${item.id}, 'aprobado')">
            Aprobar
          </button>
          <button class="btn btn--danger" onclick="decidirSolicitud(${item.id}, 'rechazado')">
            Rechazar
          </button>
        </div>
      `;
      cont.appendChild(card);
    });
  } catch (err) {
    console.error("Error al cargar solicitudes:", err);
    cont.innerHTML = "<p>Error al cargar solicitudes.</p>";
  }
}

// 4) Aprobar o rechazar una solicitud
async function decidirSolicitud(itemId, decision) {
  try {
    const res = await fetch(`http://localhost:3000/solicitudes/${itemId}/decidir`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ decision })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.mensaje || `HTTP ${res.status}`);
    alert("✅ " + data.mensaje);
    cargarSolicitudesDirector();
  } catch (err) {
    console.error("Error al decidir solicitud:", err);
    alert("❌ " + err.message);
  }
}

// 5) Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", cargarSolicitudesDirector);
