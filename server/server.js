// configura todo lo que hay en el archivo, principalmente el puerto
require('./config/config');

const express = require('express')
    // libreria de mongodb
const mongoose = require('mongoose');

const app = express()

// parsear con json los servicios rest
const bodyParser = require('body-parser')

//agregar un analizador genérico de JSON y con codificación URL
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// hacer referencia al archivo usuario.js (servicios o controladores) de las rutas del usuario
app.use(require('./routes/usuario.js'));


// conectar a la BD de MONGODB
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true },
    (err, res) => {
        // si hay error
        if (err) throw err;
        // caso contrario
        console.log('Base de datos ONLINE');
    });

//mongoose.connect('mongodb://localhost:27017/cafe', { useNewUrlParser: true, useCreateIndex: true });

app.listen(process.env.PORT, () => {

    console.log('Escuchando puerto: ', process.env.PORT);
});