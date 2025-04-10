// server.js
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const conexion = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "registro_usuarios"
});

conexion.connect((error) => {
    if (error) {
        console.error("❌ Error de conexión a la base de datos:", error);
    } else {
        console.log("✅ Conectado a la base de datos.");
    }
});

// Obtener todos los implementos
app.get("/implementos", (req, res) => {
    const sql = "SELECT * FROM implementos";
    conexion.query(sql, (err, resultados) => {
        if (err) return res.status(500).json({ error: "Error al obtener los implementos" });
        res.json(resultados);
    });
});

// Agregar un nuevo implemento
app.post("/implementos", (req, res) => {
    const { nombre, categoria, cantidad } = req.body;
    const sql = "INSERT INTO implementos (nombre, categoria, cantidad) VALUES (?, ?, ?)";
    conexion.query(sql, [nombre, categoria, cantidad], (err, resultado) => {
        if (err) return res.status(500).json({ error: "Error al agregar implemento" });
        res.json({ id: resultado.insertId, nombre, categoria, cantidad });
    });
});

// Actualizar cantidad de un implemento
app.put("/implementos/:id", (req, res) => {
    const { cantidad } = req.body;
    const { id } = req.params;
    const sql = "UPDATE implementos SET cantidad = ? WHERE id = ?";
    conexion.query(sql, [cantidad, id], (err) => {
        if (err) return res.status(500).json({ error: "Error al actualizar cantidad" });
        res.json({ mensaje: "Cantidad actualizada" });
    });
});

// Eliminar un implemento
app.delete("/implementos/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM implementos WHERE id = ?";
    conexion.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: "Error al eliminar implemento" });
        res.json({ mensaje: "Implemento eliminado" });
    });
});
// Verificar si el correo ya existe
app.get("/verificar", (req, res) => {
    const correo = req.query.correo;

    const sql = "SELECT * FROM usuarios WHERE correo = ?";
    conexion.query(sql, [correo], (error, resultados) => {
        if (error) {
            console.error("❌ Error al verificar correo:", error);
            return res.status(500).json({ error: true });
        }

        if (resultados.length > 0) {
            res.json({ registrado: true });
        } else {
            res.json({ registrado: false });
        }
    });
});
// Nueva ruta: Verificar si el correo ya está registrado
app.post("/verificar-correo", (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ registrado: false, mensaje: "❌ Correo no proporcionado." });
    }

    const sql = "SELECT * FROM usuarios WHERE correo = ?";
    conexion.query(sql, [correo], (error, resultados) => {
        if (error) {
            console.error("❌ Error al verificar correo:", error);
            return res.status(500).json({ registrado: false, mensaje: "❌ Error al consultar la base de datos." });
        }

        if (resultados.length > 0) {
            res.json({ registrado: true });
        } else {
            res.json({ registrado: false });
        }
    });
});
// Ruta para registrar datos (incluye correo)
app.post("/registro", (req, res) => {
    const { nombres, apellidos, tipo_documento, documento, telefono, correo } = req.body;

    if (!nombres || !apellidos || !tipo_documento || !documento || !telefono || !correo) {
        return res.status(400).json({ mensaje: "❌ Todos los campos son obligatorios." });
    }

    const sql = "INSERT INTO usuarios (nombres, apellidos, tipo_documento, documento, telefono, correo) VALUES (?, ?, ?, ?, ?, ?)";
    conexion.query(sql, [nombres, apellidos, tipo_documento, documento, telefono, correo], (error, resultado) => {
        if (error) {
            console.error("❌ Error al insertar datos:", error);
            res.status(500).json({ mensaje: "❌ Error al registrar en la base de datos." });
        } else {
            res.json({ mensaje: "✅ Registro exitoso" });
        }
    });
});


// Ruta para mostrar registros en tabla
app.get("/registros", (req, res) => {
    const sql = "SELECT * FROM usuarios ORDER BY id DESC";
    conexion.query(sql, (error, results) => {
        if (error) {
            console.error("❌ Error al obtener los datos:", error);
            return res.status(500).send("<h2>❌ Error al obtener los datos.</h2>");
        }

        let html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de Registros</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; background-color: #f4f4f4; }
                h2 { text-align: center; color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 10px; overflow: hidden; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #4CAF50; color: white; }
                tr:nth-child(even) { background-color: #f2f2f2; }
                tr:hover { background-color: #ddd; }
            </style>
        </head>
        <body>
            <h2>Lista de Registros</h2>
            ${results.length === 0 ? "<h3 style='text-align:center; color:red;'>❌ No hay registros disponibles.</h3>" : ""}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Tipo de Documento</th>
                        <th>Número de Documento</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                    </tr>
                </thead>
                <tbody>
        `;

        results.forEach(registro => {
            html += `
                <tr>
                    <td>${registro.id}</td>
                    <td>${registro.nombres}</td>
                    <td>${registro.apellidos}</td>
                    <td>${registro.tipo_documento}</td>
                    <td>${registro.documento}</td>
                    <td>${registro.telefono}</td>
                    <td>${registro.correo}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        </body>
        </html>
        `;

        res.send(html);
    });
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
