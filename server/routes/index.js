// se copian todas las rutas de los archivos para qeu se puedan visualizar los servicios desde 
// las aplicaciones (postman, etc)
const express = require('express')
    // inicializarlo express
const app = express()

// hacer referencia al archivo usuario.js (servicios o controladores) de las rutas del usuario
app.use(require('./usuario.js'));
app.use(require('./login.js'));
app.use(require('./categoria.js'));
app.use(require('./producto.js'));
app.use(require('./Carga.js'));
app.use(require('./imagenes.js'));

module.exports = app;