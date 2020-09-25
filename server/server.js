// configura todo lo que hay en el archivo, principalmente el puerto
require('./config/config');

const express = require('express')
    // libreria de mongodb
const mongoose = require('mongoose');
// Se ingresa el path para publicar sitios
const path = require('path');

const app = express()

// parsear con json los servicios rest
const bodyParser = require('body-parser')

//agregar un analizador genérico de JSON y con codificación URL
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Habilitar la crpeta public para que puedan visualizar las paginas web
app.use(express.static(path.resolve(__dirname, './public')));

// envia segmentos del path y lo resuleve por nosotros, (revisar la dirección correcta)
//console.log(path.resolve(__dirname, '../public'));

// AQUI va la Configuración global de rutas """"""""""""""""""""""""22
// hacer referencia al archivo usuario.js (servicios o controladores) de las rutas del usuario
// app.use(require('./routes/usuario.js'));  // esto se traspado a routes/index.js
// hacer referencia al archivo login.js (servicios o controladores) de las rutas del usuari
app.use(require('./routes/index.js'));


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