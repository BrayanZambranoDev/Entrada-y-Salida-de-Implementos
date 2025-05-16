// server.js
require('dotenv').config();
console.log("→ Env cargadas:", {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  EMAIL_USER:       process.env.EMAIL_USER,
  EMAIL_PASS:       process.env.EMAIL_PASS ? '****(ok)' : '(vacío)'
});

const express       = require("express");
const mysql         = require("mysql");
const cors          = require("cors");
const multer        = require("multer");
const path          = require("path");
const fs            = require("fs");
const nodemailer    = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

const app = express();
app.use(express.json());
app.use(cors());

// ─── Configuración Google OAuth ────────────────────────────────────────────────
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!CLIENT_ID) {
  console.error("❌ Debes exportar GOOGLE_CLIENT_ID en tu entorno");
  process.exit(1);
}
const googleClient = new OAuth2Client(CLIENT_ID);

// ─── Configuración Nodemailer (Gmail + App Password) ──────────────────────────
const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // tu correo @gmail.com
    pass: process.env.EMAIL_PASS   // contraseña de aplicación
  }
});

// ─── Conexión a MySQL ──────────────────────────────────────────────────────────
const conexion = mysql.createConnection({
  host:     "localhost",
  user:     "root",
  password: "TuNuevaPass123!",
  database: "registro_usuarios"
});
conexion.connect(err => {
  if (err) console.error("❌ Error de conexión a DB:", err);
  else console.log("✅ Conectado a DB.");
});

// ─── Middlewares de Autenticación y Roles ──────────────────────────────────────
async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }
  const idToken = auth.split(" ")[1];
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: CLIENT_ID
    });
    const email = ticket.getPayload().email;
    conexion.query(
      "SELECT rol FROM usuarios WHERE correo = ?",
      [email],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        if (!rows.length) return res.status(403).json({ error: "Usuario no registrado" });
        req.user = { email, rol: rows[0].rol };
        next();
      }
    );
  } catch (e) {
    console.error("❌ Error al verificar Google ID token:", e);
    res.status(401).json({ error: "Token inválido" });
  }
}

function ensureDirector(req, res, next) {
  if (req.user.rol === "director") return next();
  res.status(403).json({ error: "Solo Director." });
}

function ensureAdmin(req, res, next) {
  const rolesAdmin = ["biblioteca", "mercadeo", "servicios generales"];
  if (rolesAdmin.includes(req.user.rol)) return next();
  res.status(403).json({ error: "Solo Administrador." });
}

function ensureCelador(req, res, next) {
  if (req.user.rol === "celador") return next();
  res.status(403).json({ error: "Solo Celador." });
}

// ─── Setup Multer para subir imágenes ─────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) =>
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// ─── RUTAS PÚBLICAS ────────────────────────────────────────────────────────────

// GET /implementos
app.get("/implementos", (req, res) => {
  conexion.query("SELECT * FROM implementos", (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

// ← Inserta aquí la ruta POST /implementos:
// POST /implementos  ← crea nuevos
app.post("/implementos", upload.single("imagen"), (req, res) => {
  const { nombre, categoria, cantidad } = req.body;
  if (!nombre || !categoria || !cantidad) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;
  conexion.query(
    "INSERT INTO implementos (nombre, categoria, cantidad, imagen_url) VALUES (?,?,?,?)",
    [nombre, categoria, cantidad, imagen_url],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al agregar implemento" });
      res.status(201).json({
        id: result.insertId,
        nombre,
        categoria,
        cantidad,
        imagen_url
      });
    }
  );
});
// PuST /implementos  ← aquí estaba el hueco
app.put("/implementos/:id", upload.single("imagen"), (req, res) => {
  console.log(`🔄 PUT /implementos/${req.params.id} recibido`);
  const id = req.params.id;
  const { nombre, categoria, cantidad } = req.body;
  
  // Si no hay valores, devolver error
  if (!nombre || !categoria || !cantidad) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  
  // Consultar si existe la imagen actual
  conexion.query("SELECT imagen_url FROM implementos WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("Error al buscar implemento:", err);
      return res.status(500).json({ error: "Error al buscar implemento" });
    }
    
    if (!rows.length) {
      return res.status(404).json({ error: "Implemento no encontrado" });
    }
    
    let imagen_url = rows[0].imagen_url;
    
    // Si hay una nueva imagen, actualizar la URL
    if (req.file) {
      // Borrar imagen anterior si existe y no es la por defecto
      if (imagen_url && !imagen_url.includes('placeholder') && fs.existsSync(path.join(__dirname, imagen_url))) {
        try {
          fs.unlinkSync(path.join(__dirname, imagen_url));
        } catch (err) {
          console.warn("No se pudo eliminar la imagen anterior:", err);
        }
      }
      
      // Actualizar con la nueva imagen
      imagen_url = `/uploads/${req.file.filename}`;
    }
    
    // Actualizar en la base de datos
    const sql = `
      UPDATE implementos 
      SET nombre = ?, categoria = ?, cantidad = ?, imagen_url = ?
      WHERE id = ?
    `;
    
    conexion.query(sql, [nombre, categoria, cantidad, imagen_url, id], (updateErr) => {
      if (updateErr) {
        console.error("Error al actualizar implemento:", updateErr);
        return res.status(500).json({ error: "Error al actualizar implemento" });
      }
      
      res.json({
        id: parseInt(id),
        nombre,
        categoria,
        cantidad,
        imagen_url
      });
    });
  });
});

// DELETE /implementos/:id
app.delete("/implementos/:id", (req, res) => {
  console.log(`❌ DELETE /implementos/${req.params.id} recibido`);
  const id = req.params.id;
  
  // Primero obtener la información para poder eliminar la imagen
  conexion.query("SELECT imagen_url FROM implementos WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("Error al buscar implemento:", err);
      return res.status(500).json({ error: "Error al buscar implemento" });
    }
    
    if (!rows.length) {
      return res.status(404).json({ error: "Implemento no encontrado" });
    }
    
    // Si hay imagen, intentar borrarla
    const imagen_url = rows[0].imagen_url;
    if (imagen_url && !imagen_url.includes('placeholder')) {
      const ruta_imagen = path.join(__dirname, imagen_url);
      if (fs.existsSync(ruta_imagen)) {
        try {
          fs.unlinkSync(ruta_imagen);
        } catch (err) {
          console.warn("No se pudo eliminar la imagen:", err);
        }
      }
    }
    
    // Borrar el registro de la base de datos
    conexion.query("DELETE FROM implementos WHERE id = ?", [id], (deleteErr) => {
      if (deleteErr) {
        console.error("Error al eliminar implemento:", deleteErr);
        return res.status(500).json({ error: "Error al eliminar implemento" });
      }
      
      res.json({ mensaje: "Implemento eliminado correctamente" });
    });
  });
});


// POST /registro
app.post("/registro", (req, res) => {
  const { nombres, apellidos, tipo_documento, documento, telefono, correo } = req.body;
  if (![nombres,apellidos,tipo_documento,documento,telefono,correo].every(Boolean)) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }
  const sql = "INSERT INTO usuarios (nombres,apellidos,tipo_documento,documento,telefono,correo) VALUES (?,?,?,?,?,?)";
  conexion.query(sql, [nombres,apellidos,tipo_documento,documento,telefono,correo], err => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: "Usuario registrado." });
  });
});

// GET /verificar?correo=…
app.get("/verificar", (req, res) => {
  const correo = req.query.correo;
  conexion.query("SELECT rol FROM usuarios WHERE correo = ?", [correo], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (!rows.length) return res.json({ registrado: false });
    res.json({ registrado: true, rol: rows[0].rol });
  });
});

// POST /solicitud  ← usuario autenticado
app.post("/solicitud", authenticate, (req, res) => {
  const usuario = req.user.email;
  const { items } = req.body;
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "No hay items en la solicitud." });
  }

  // 1) Crear grupo
  conexion.query(
    "INSERT INTO solicitud_grupo (usuario) VALUES (?)",
    [usuario],
    (err, grp) => {
      if (err) return res.status(500).json({ error: err });
      const grupoId = grp.insertId;

      // 2) Resolver implementos
      const lookups = items.map(it => new Promise((ok, fail) => {
        conexion.query(
          "SELECT id,categoria FROM implementos WHERE nombre = ?",
          [it.nombre],
          (e, rows) => {
            if (e) return fail(e);
            if (!rows.length) return fail("Implemento no encontrado");
            ok({ producto_id: rows[0].id, categoria: rows[0].categoria });
          }
        );
      }));

      Promise.all(lookups)
        .then(results => {
          // 3) Insertar items
          const vals = items.map((it,i)=>[
            grupoId,
            results[i].producto_id,
            it.cantidad,
            it.comentario||"",
            results[i].categoria
          ]);
          conexion.query(
            "INSERT INTO solicitud_item (grupo_id,producto_id,cantidad,comentario,categoria) VALUES ?",
            [vals],
            err2 => {
              if (err2) return res.status(500).json({ error: err2 });

              // 4) Notificar al Director
              conexion.query(
                "SELECT correo FROM usuarios WHERE rol = 'director'",
                (err3, dirs) => {
                  if (!err3 && dirs.length) {
                    const to = dirs.map(d=>d.correo).join(",");
                    mailer.sendMail({
                      from: process.env.EMAIL_USER,
                      to,
                      subject: `Nueva solicitud #${grupoId}`,
                      text: `El usuario ${usuario} ha solicitado implementos (grupo ${grupoId}).`
                    }, eMailErr => {
                      if (eMailErr) console.error("❌ Error enviando e-mail al Director:", eMailErr);
                    });
                  }
                }
              );

              res.json({ mensaje: "Solicitud registrada.", grupoId });
            }
          );
        })
        .catch(e=> res.status(500).json({ error: e }));
    }
  );
});

// ─── RUTAS PROTEGIDAS ──────────────────────────────────────────────────────────

// GET /solicitudes/director
app.get("/solicitudes/director", authenticate, ensureDirector, (req, res) => {
  const sql = `
    SELECT si.id, si.grupo_id, i.nombre AS producto, si.cantidad, si.comentario,
           si.categoria, sg.usuario AS solicitante, sg.fecha AS fecha_pedido
    FROM solicitud_item si
    JOIN implementos i ON si.producto_id = i.id
    JOIN solicitud_grupo sg ON si.grupo_id = sg.id
    WHERE si.estado_director='pendiente'
    ORDER BY sg.fecha DESC
  `;
  conexion.query(sql, (err, rows) =>
    err ? res.status(500).json({ error: err }) : res.json(rows)
  );
});

// POST /solicitudes/:itemId/decidir
app.post("/solicitudes/:itemId/decidir",
  authenticate, ensureDirector,
  (req, res) => {
    const { itemId } = req.params;
    const { decision } = req.body; // 'aprobado' | 'rechazado'
    if (!["aprobado","rechazado"].includes(decision)) {
      return res.status(400).json({ error: "Decisión inválida." });
    }

    // 1) Actualizar estado
    conexion.query(
      "UPDATE solicitud_item SET estado_director=?,fecha_aprobacion_director=NOW() WHERE id=?",
      [decision, itemId],
      err => {
        if (err) return res.status(500).json({ error: err });

        // 2) Si aprobó, notificar a Admin de esa categoría
        if (decision === "aprobado") {
          const sql2 = `
            SELECT si.grupo_id, si.categoria, sg.usuario AS solicitante
            FROM solicitud_item si
            JOIN solicitud_grupo sg ON si.grupo_id=sg.id
            WHERE si.id=?
          `;
          conexion.query(sql2, [itemId], (e2, rows2) => {
            if (e2||!rows2.length) return res.json({ mensaje:"Decisión registrada." });
            const { categoria, solicitante, grupo_id } = rows2[0];

            conexion.query(
              "SELECT correo FROM usuarios WHERE rol = ?",
              [categoria.toLowerCase()],
              (e3, admins) => {
                if (!e3 && admins.length) {
                  const to = admins.map(a=>a.correo).join(',');
                  mailer.sendMail({
                    from: process.env.EMAIL_USER,
                    to,
                    subject: `Solicitud #${grupo_id} aprobada`,
                    text: `La solicitud #${grupo_id} de ${solicitante} ha sido aprobada para la categoría "${categoria}".`
                  }, eMailErr=>{
                    if(eMailErr) console.error("❌ Error e-mail Admin:", eMailErr);
                  });
                }
              }
            );
          });
        }

        res.json({ mensaje: "Decisión registrada." });
      }
    );
  }
);

// GET /solicitudes/admin
app.get("/solicitudes/admin", authenticate, ensureAdmin, (req, res) => {
  const rol = req.user.rol;
  const sql = `
    SELECT
      si.id,
      si.grupo_id,
      u.nombres,
      u.apellidos,
      u.correo,
      u.tipo_documento,
      u.documento,
      u.telefono,
      i.nombre    AS producto,
      si.cantidad,
      si.comentario,
      si.categoria,
      si.estado_director,
      si.estado_admin,
      sg.fecha    AS fecha_pedido,
      si.fecha_aprobacion_director,
      si.fecha_entrega_admin
    FROM solicitud_item si
    JOIN implementos     i  ON si.producto_id = i.id
    JOIN solicitud_grupo sg ON si.grupo_id    = sg.id
    JOIN usuarios        u  ON sg.usuario       = u.correo
    WHERE si.estado_director = 'aprobado'
      AND si.categoria       = ?
      AND si.estado_admin    = 'pendiente'
    ORDER BY si.fecha_aprobacion_director DESC
  `;
  conexion.query(sql, [rol], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

// POST /solicitudes/:itemId/entregar
app.post("/solicitudes/:itemId/entregar",
  authenticate, ensureAdmin,
  (req, res) => {
    const { itemId } = req.params;
    conexion.query(
      "UPDATE solicitud_item SET estado_admin='entregada',fecha_entrega_admin=NOW() WHERE id=?",
      [itemId],
      err => {
        if (err) return res.status(500).json({ error: err });

        // Notificar Celador
        const sql2 = `
          SELECT si.grupo_id, sg.usuario AS solicitante
          FROM solicitud_item si
          JOIN solicitud_grupo sg ON si.grupo_id=sg.id
          WHERE si.id=?
        `;
        conexion.query(sql2, [itemId], (e2, r2) => {
          if (!e2 && r2.length) {
            const { grupo_id, solicitante } = r2[0];
            conexion.query(
              "SELECT correo FROM usuarios WHERE rol='celador'",
              (e3, cels) => {
                if (!e3 && cels.length) {
                  const to = cels.map(c=>c.correo).join(',');
                  mailer.sendMail({
                    from: process.env.EMAIL_USER,
                    to,
                    subject: `Salida lista para Grupo #${grupo_id}`,
                    text: `El Administrador entregó los implementos del Grupo #${grupo_id} (solicitante: ${solicitante}).`
                  }, ()=>{});
                }
              }
            );
          }
        });

        res.json({ mensaje: "Entregado por Admin." });
      }
    );
  }
);

// GET /solicitudes/celador
app.get("/solicitudes/celador", authenticate, ensureCelador, (_, res) => {
  const sql = `
    SELECT si.id, si.grupo_id, i.nombre AS producto, si.cantidad,
           si.fecha_entrega_admin, sg.usuario AS solicitante
    FROM solicitud_item si
    JOIN implementos i ON si.producto_id=i.id
    JOIN solicitud_grupo sg ON si.grupo_id=sg.id
    WHERE si.estado_admin='entregada' AND si.estado_celador='pendiente'
    ORDER BY si.fecha_entrega_admin DESC
  `;
  conexion.query(sql, (err, rows) =>
    err ? res.status(500).json({ error: err }) : res.json(rows)
  );
});

// POST /solicitudes/:itemId/salida
app.post("/solicitudes/:itemId/salida",
  authenticate, ensureCelador,
  (req, res) => {
    const { itemId } = req.params;
    conexion.query(
      "UPDATE solicitud_item SET estado_celador='salida',fecha_revision_salida=NOW() WHERE id=?",
      [itemId],
      err => {
        if (err) return res.status(500).json({ error: err });

        // Notificar Usuario que ya salió
        const sql2 = `
          SELECT si.grupo_id, sg.usuario AS solicitante
          FROM solicitud_item si
          JOIN solicitud_grupo sg ON si.grupo_id=sg.id
          WHERE si.id=?
        `;
        conexion.query(sql2, [itemId], (e2, r2) => {
          if (!e2 && r2.length) {
            const { grupo_id, solicitante } = r2[0];
            mailer.sendMail({
              from: process.env.EMAIL_USER,
              to: solicitante,
              subject: `Implementos entregados al Celador (#${grupo_id})`,
              text: `Tus implementos (Grupo #${grupo_id}) han salido del depósito.`
            }, ()=>{});
          }
        });

        res.json({ mensaje: "Salida registrada." });
      }
    );
  }
);

// GET /solicitudes/celador/retorno
app.get("/solicitudes/celador/retorno", authenticate, ensureCelador, (req, res) => {
  const sql = `
    SELECT si.id, si.grupo_id, i.nombre AS producto, si.cantidad,
           si.fecha_entrega_admin, si.fecha_revision_salida, sg.usuario AS solicitante
    FROM solicitud_item si
    JOIN implementos i ON si.producto_id=i.id
    JOIN solicitud_grupo sg ON si.grupo_id=sg.id
    WHERE si.estado_admin='entregada' AND si.estado_celador='salida'
    ORDER BY si.fecha_revision_salida DESC
  `;
  conexion.query(sql, (err, rows) =>
    err ? res.status(500).json({ error: err }) : res.json(rows)
  );
});

// POST /solicitudes/:itemId/retorno
app.post("/solicitudes/:itemId/retorno",
  authenticate, ensureCelador,
  (req, res) => {
    const { itemId } = req.params;
    conexion.query(
      "UPDATE solicitud_item SET estado_celador='retorno',fecha_revision_retorno=NOW() WHERE id=?",
      [itemId],
      err => {
        if (err) return res.status(500).json({ error: err });

        // Notificar Admin de retorno
        const sql2 = `
          SELECT si.grupo_id, si.categoria, sg.usuario AS solicitante
          FROM solicitud_item si
          JOIN solicitud_grupo sg ON si.grupo_id=sg.id
          WHERE si.id=?
        `;
        conexion.query(sql2, [itemId], (e2, r2) => {
          if (!e2 && r2.length) {
            const { grupo_id, categoria, solicitante } = r2[0];
            conexion.query(
              "SELECT correo FROM usuarios WHERE rol = ?",
              [categoria.toLowerCase()],
              (e3, admins) => {
                if (!e3 && admins.length) {
                  const to = admins.map(a=>a.correo).join(',');
                  mailer.sendMail({
                    from: process.env.EMAIL_USER,
                    to,
                    subject: `Retorno pendiente (#${grupo_id})`,
                    text: `El Celador marcó retorno para Grupo #${grupo_id} (solicitante: ${solicitante}).`
                  }, ()=>{});
                }
              }
            );
          }
        });

        res.json({ mensaje: "Retorno registrado." });
      }
    );
  }
);

// GET /solicitudes/admin/entregadas
app.get("/solicitudes/admin/entregadas",
  authenticate, ensureAdmin,
  (req, res) => {
    const rol = req.user.rol;
    const sql = `
      SELECT si.id, si.grupo_id,
             u.nombres, u.apellidos, u.correo, u.tipo_documento, u.documento, u.telefono,
             i.nombre AS producto, si.cantidad, si.comentario,
             si.categoria, si.estado_admin, si.fecha_entrega_admin,
             sg.usuario AS solicitante, sg.fecha AS fecha_pedido
      FROM solicitud_item si
      JOIN implementos i  ON si.producto_id = i.id
      JOIN solicitud_grupo sg ON si.grupo_id = sg.id
      JOIN usuarios u      ON sg.usuario    = u.correo
      WHERE si.estado_director='aprobado' AND si.estado_admin='entregada' AND si.categoria=?
      ORDER BY si.fecha_entrega_admin DESC
    `;
    conexion.query(sql, [rol], (err, rows) =>
      err ? res.status(500).json({ error: err }) : res.json(rows)
    );
  }
);

// GET /solicitudes/admin/retornos
app.get("/solicitudes/admin/retornos",
  authenticate, ensureAdmin,
  (req, res) => {
    const rol = req.user.rol;
    const sql = `
      SELECT 
        si.id,
        si.grupo_id,
        i.nombre AS producto,
        si.cantidad,
        si.categoria,
        si.estado_celador,
        si.fecha_revision_retorno,
        sg.usuario AS correo,   -- Aquí trae el correo
        u.nombres,
        u.apellidos,
        u.tipo_documento,
        u.documento,
        u.telefono,
        si.comentario,
        sg.fecha AS fecha_pedido
      FROM solicitud_item si
      JOIN implementos i         ON si.producto_id = i.id
      JOIN solicitud_grupo sg    ON si.grupo_id = sg.id
      JOIN usuarios u            ON sg.usuario = u.correo   -- JOIN con usuarios por correo
      WHERE si.estado_director = 'aprobado'
        AND si.estado_admin    = 'entregada'
        AND si.estado_celador = 'retorno'
        AND si.categoria = ?
      ORDER BY si.fecha_revision_retorno DESC
    `;
    conexion.query(sql, [rol], (err, rows) =>
      err ? res.status(500).json({ error: err }) : res.json(rows)
    );
  }
);


// POST /solicitudes/:itemId/recibir
app.post("/solicitudes/:itemId/recibir",
  authenticate, ensureAdmin,
  (req, res) => {
    const { itemId } = req.params;
    const { comentario } = req.body;
    conexion.query(
      `UPDATE solicitud_item
         SET estado_celador='cerrado', fecha_recepcion_admin=NOW(), comentario_recepcion=?
       WHERE id=?`,
      [comentario||'', itemId],
      err => {
        if (err) return res.status(500).json({ error: err });

        // Notificar Usuario de finalización
        const sql2 = `
          SELECT si.grupo_id, sg.usuario AS solicitante
          FROM solicitud_item si
          JOIN solicitud_grupo sg ON si.grupo_id=sg.id
          WHERE si.id=?
        `;
        conexion.query(sql2, [itemId], (e2, r2) => {
          if (!e2 && r2.length) {
            const { grupo_id, solicitante } = r2[0];
            mailer.sendMail({
              from: process.env.EMAIL_USER,
              to: solicitante,
              subject: `Devolución procesada (#${grupo_id})`,
              text: `Tu devolución del Grupo #${grupo_id} ha sido procesada. Gracias.`
            }, ()=>{});
          }
        });

        res.json({ mensaje: "Devolución registrada." });
      }
    );
  }
);

// ─── Iniciar servidor ─────────────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
