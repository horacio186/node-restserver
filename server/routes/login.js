const express = require('express')
    // creamos una constante para encriptar contraseña
const bcrypt = require('bcrypt');
// declarar el token
var jwt = require('jsonwebtoken');

// Using a Google API Client Library
const { OAuth2Client } = require('google-auth-library');
// se configuro con config.js como variable de entorno (process.env.CLIENT_ID)
const client = new OAuth2Client(process.env.CLIENT_ID);

// definimos el objeto del modelo del esquema Usuario
const Usuario = require('../models/usuario');
const e = require('express');

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
            return res.status(500).json({
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

// Configuraciones de google, asyns regresa una promesa
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload(); // toda la información del usuario (nombre, imagem, etc)
    //console.log(payload.name);   para probar
    //console.log(payload.email);
    //console.log(payload.picture);

    // la promesa regresa un objeto de google
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


// Obtener el tocken de google, cuando se hace un posteo
app.post('/google', async(req, res) => {

    // el token que se envia desde el index.html ->  xhr.enviar('idtoken =' + id_token);
    let token = req.body.idtoken;

    // llama a la función de google
    let googleUser = await verify(token) // toda la información del usuario
        .catch(e => {
            // tocken invalido 
            return res.status(403).json({
                ok: false,
                err: e
            })
        });
    // para probar
    //res.json({
    //body: req.body,  para probar que trae el body
    //token             para probar
    //    usuario: googleUser
    //})

    // Verificar validaciones en la Base de datos
    // 1° Verificar que no exista un usuario en mi BD con ese correo
    Usuario.findOne({ email: googleUser.email }, (err, UsuarioDB) => {

        // si hay un error muestra el mensaje y sale con el return
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        // Si el usuario ya esta autentificado en la BD no debe autentificarse mediante google, 
        // pero si nunca se ha autentificado se crea
        if (usuarioDB) {
            // no dejamos que se autentifique con google, pq ya esta autenticado de manera normal
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {
                // Si Es un usuario autentificado por google se tiene que actualizar el tocken nuestro
                let token = jwt.sign({
                    usuario: usuarioDB // información de toda la BD
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                // respuesta
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });
            }
            // Condición Si el usuario NO existe en nuestra BD     
        } else {
            let usuario = new Usuario(); // se crea un objeto para obtener las propiedades
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';
            // graba en la BD
            usuario.save((err, usuarioDB) => {

                // si hay un error al momento de grabar muestra el mensaje y sale con el return
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };
                // SINO Genero un nuevo tocken y lo mando a imprinir como una respuesta del json 
                // Si Es un usuario autentificado de google se tiene que actualizar el tocken
                let token = jwt.sign({
                    usuario: usuarioDB // información de toda la BD
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                // respuesta
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });

            });
        }

    });

})

module.exports = app;