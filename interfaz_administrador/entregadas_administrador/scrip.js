// archivo: interfaz_administrador/entregadas_administrador/scrip.js

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
  
  function cargarEntregadas() {
    const rol = localStorage.getItem("rol")?.trim().toLowerCase();
    fetch("http://localhost:3000/solicitudes")
      .then(res => res.json())
      .then(data => {
        const entregadas = data.filter(s =>
          s.estado === "entregada" &&
          typeof s.categoria === "string" &&
          s.categoria.trim().toLowerCase() === rol
        );
  
        const cont = document.getElementById("contenedor-entregados");
        cont.innerHTML = '<h1 class="category-title">Historial de Entregas</h1>';
  
        if (!entregadas.length) {
          cont.innerHTML += "<p>No hay solicitudes entregadas para tu sección.</p>";
          return;
        }
  
        const porUsuario = entregadas.reduce((acc, s) => {
          (acc[s.nombre_usuario] = acc[s.nombre_usuario] || []).push(s);
          return acc;
        }, {});
  
        Object.values(porUsuario).forEach(arr => {
          const u = arr[0];
          const div = document.createElement("div");
          div.className = "category";
          div.innerHTML = `
            <h2>${u.nombres} ${u.apellidos}</h2>
            <p><strong>Correo:</strong> ${u.nombre_usuario}</p>
            <p><strong>Documento:</strong> ${u.documento}</p>
            <p><strong>Teléfono:</strong> ${u.telefono}</p>
            <hr>
            <ul>
              ${arr
                .map(item => `
                  <li>
                    ${item.nombre_producto} (${item.cantidad}) —
                    <small>${new Date(item.fecha_entrega).toLocaleString()}</small>
                  </li>
                `)
                .join("")}
            </ul>
          `;
          cont.appendChild(div);
        });
      })
      .catch(err => {
        console.error("❌ Error al cargar solicitudes:", err);
        document.getElementById("contenedor-entregados").innerHTML =
          "<p>Error al cargar solicitudes entregadas.</p>";
      });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    cargarEntregadas();
    document
      .querySelectorAll(".submenu > a")
      .forEach(link => link.addEventListener("click", toggleSubmenu));
  });
  