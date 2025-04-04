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
    database: "mercadeo"
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
