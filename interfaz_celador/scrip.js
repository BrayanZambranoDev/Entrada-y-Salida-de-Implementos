// scrip.js (Celador)

// 1) Cierra sesión y limpia todo
function cerrarSesion() {
  localStorage.removeItem("correo");
  localStorage.removeItem("rol");
  localStorage.removeItem("id_token");
  window.location.href = "../index.html";
}

// 2) Cabeceras con token
function authHeaders() {
  const token = localStorage.getItem("id_token");
  return token
    ? { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

// 3) Registrar Salida
function registrarSalida(itemId) {
  fetch(`http://localhost:3000/solicitudes/${itemId}/salida`, {
    method: "POST",
    headers: authHeaders()
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(cargarPendientes)
    .catch(err => {
      console.error(err);
      if (err.message.includes("401")) {
        alert("❌ Sesión expirada. Por favor, inicia sesión de nuevo.");
        cerrarSesion();
      } else {
        alert("❌ Error al registrar salida.");
      }
    });
}

// 4) Registrar Retorno
function registrarRetorno(itemId) {
  fetch(`http://localhost:3000/solicitudes/${itemId}/retorno`, {
    method: "POST",
    headers: authHeaders()
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(cargarPendientes)
    .catch(err => {
      console.error(err);
      if (err.message.includes("401")) {
        alert("❌ Sesión expirada. Por favor, inicia sesión de nuevo.");
        cerrarSesion();
      } else {
        alert("❌ Error al registrar retorno.");
      }
    });
}

// 5) Carga salidas y retornos pendientes
function cargarPendientes() {
  const headers = authHeaders();

  // — Pendientes de Salida —
  const contSalida = document.getElementById("pendientes-salida");
  contSalida.innerHTML = "<p>Cargando…</p>";
  fetch("http://localhost:3000/solicitudes/celador", { headers })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      contSalida.innerHTML = "";
      if (data.length === 0) {
        contSalida.innerHTML = "<p>No hay ítems para salida.</p>";
        return;
      }
      data.forEach(i => {
        const card = document.createElement("div");
        card.className = "card mb-3";
        card.innerHTML = `
          <div class="card-header">
            Grupo #${i.grupo_id} — 
            <small>${new Date(i.fecha_entrega_admin).toLocaleString()}</small>
          </div>
          <div class="card-body">
            <p><strong>Usuario:</strong> ${i.solicitante}</p>
            <p><strong>Producto:</strong> ${i.producto} (${i.cantidad})</p>
            <button class="btn btn-success" onclick="registrarSalida(${i.id})">
              Registrar Salida
            </button>
          </div>
        `;
        contSalida.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      contSalida.innerHTML = "<p>Error al cargar salidas.</p>";
    });

  // — Pendientes de Retorno —
  const contRetorno = document.getElementById("pendientes-retorno");
  contRetorno.innerHTML = "<p>Cargando…</p>";
  fetch("http://localhost:3000/solicitudes/celador/retorno", { headers })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      contRetorno.innerHTML = "";
      if (data.length === 0) {
        contRetorno.innerHTML = "<p>No hay ítems para retorno.</p>";
        return;
      }
      data.forEach(i => {
        const card = document.createElement("div");
        card.className = "card mb-3";
        card.innerHTML = `
          <div class="card-header">
            Grupo #${i.grupo_id} — 
            <small>Salida: ${new Date(i.fecha_revision_salida).toLocaleString()}</small>
          </div>
          <div class="card-body">
            <p><strong>Usuario:</strong> ${i.solicitante}</p>
            <p><strong>Producto:</strong> ${i.producto} (${i.cantidad})</p>
            <button class="btn btn--outline btn--danger" onclick="registrarRetorno(${i.id})">
              Registrar Retorno
            </button>
          </div>
        `;
        contRetorno.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      contRetorno.innerHTML = "<p>Error al cargar retornos.</p>";
    });
}

// 6) Inicialización al cargar el DOM
document.addEventListener("DOMContentLoaded", cargarPendientes);
