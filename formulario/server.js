const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de la base de datos con mejor manejo de conexiones
const conexion = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "root",
    database: "registro_usuarios"
});

// Verificar conexión
conexion.getConnection((error, connection) => {
    if (error) {
        console.error("❌ Error de conexión a la base de datos:", error);
        return;
    }
    console.log("✅ Conectado a la base de datos.");
    connection.release();
});

// Ruta para registrar datos
app.post("/registro", (req, res) => {
    const { nombres, apellidos, tipo_documento, documento, telefono } = req.body;

    if (!nombres || !apellidos || !tipo_documento || !documento || !telefono) {
        return res.status(400).json({ mensaje: "❌ Todos los campos son obligatorios." });
    }

    const sql = "INSERT INTO usuarios (nombres, apellidos, tipo_documento, documento, telefono) VALUES (?, ?, ?, ?, ?)";
    conexion.query(sql, [nombres, apellidos, tipo_documento, documento, telefono], (error, resultado) => {
        if (error) {
            console.error("❌ Error al insertar datos:", error);
            res.status(500).json({ mensaje: "❌ Error al registrar en la base de datos." });
        } else {
            res.json({ mensaje: "✅ Registro exitoso" });
        }
    });
});

// Ruta para obtener registros en formato tabla HTML
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
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        </body>
        </html>
        `;

        res.send(html); // Enviar la tabla como respuesta
    });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
