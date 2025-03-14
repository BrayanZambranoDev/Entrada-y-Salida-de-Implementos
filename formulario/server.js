const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Configurar la conexión a la base de datos
const conexion = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root", // Cambia esto si tienes contraseña en tu MySQL
    database: "registro_usuarios" // Asegúrate de que el nombre sea correcto
});

conexion.connect(error => {
    if (error) {
        console.error("Error de conexión a la base de datos:", error);
        return;
    }
    console.log("✅ Conectado a la base de datos.");
});

// Ruta para recibir datos del formulario
app.post("/registro", (req, res) => {
    const { nombres, apellidos, tipo_documento, documento, telefono } = req.body;

    if (!nombres || !apellidos || !tipo_documento || !documento || !telefono) {
        return res.json({ mensaje: "⚠️ Todos los campos son obligatorios." });
    }

    const sql = "INSERT INTO usuarios (nombres, apellidos, tipo_documento, documento, telefono) VALUES (?, ?, ?, ?, ?)";
    conexion.query(sql, [nombres, apellidos, tipo_documento, documento, telefono], (error, results) => {
        if (error) {
            console.error("Error al insertar datos:", error);
            return res.json({ mensaje: "❌ Error al guardar los datos." });
        }
        res.json({ mensaje: "✅ Registro exitoso." });
    });
});

// Iniciar servidor
app.listen(3000, () => {
    console.log("🚀 Servidor corriendo en http://localhost:3000");
});
