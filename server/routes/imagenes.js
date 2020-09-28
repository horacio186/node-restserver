const express = require('express');

const fs = require('fs');
const path = require('path'); // configurar el path
// se agrega el token para dar mas seguridad al path de la imagen
// para que solo los usuarios de la BD puedan visualizar las imagenes
const { verificaToken } = require('../middlewares/autentificacion');

let app = express();

// crear una unica ruta para desplegar la imagen
// Nota: Agregar un middleware (verificaToken) no se muestra en la pagina web, es por headers
app.get('/imagen/:tipo/:img', verificaToken, (req, res) => {

    let tipo = req.params.tipo;
    let imagen = req.params.img;
    // path de la imagen
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${imagen}`);

    // Verificar si existe la imagen en el path
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        // construir el path cuando la imagen no se encuentre
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }


});


module.exports = app;