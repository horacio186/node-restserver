const express = require('express')
    // creamos una constante para encriptar contraseña
const bcrypt = require('bcrypt');
// declarar el token
var jwt = require('jsonwebtoken');

// definimos el objeto del modelo del esquema Usuario
const Usuario = require('../models/usuario');

// inicializarlo express
const app = express()

// crear nuevo registro   """"""""""""""""""""""""""""""""""""""""""""""""""""""
app.post('/login', (req, res) => {

    // se trabajará el body, el email y password
    let body = req.body;
    // verificar que el email existe, regresar solo 1 registro encontrado
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        // si hay un error muestra el mensaje y sale con el return
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // verificar si no viene un email en la BD, si no existe el usuario
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "(Usuario) o contraseña incorrectos"
                }
            });
        }

        // Evaluar la contraseña, compara la contraseña escrita desde el body con la contraseña de la
        // base de datos, devuelve un true o false
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o (contraseña) incorrectos"
                }
            });
        }

        // terminado las validaciones la respuesta corresta u OK
        // Configurar TOKEN  ************************************************
        // despues del sign viene el payload, secret y la expiración(30 dias, ss,mm,horas, dias)
        // La SEMILLA se configura en config.js (variable de entorno)
        let token = jwt.sign({
            usuario: usuarioDB // información de toda la BD
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token // mismo que token:token
        })
    })

});



module.exports = app;