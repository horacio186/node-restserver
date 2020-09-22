const express = require('express')

// creamos una constante para encriptar contraseña
const bcrypt = require('bcrypt');
// undescore para indicar solo los camopos que vamos  a validar
const _ = require('underscore');

// definimos el objeto del modelo del esquema Usuario
const Usuario = require('../models/usuario');

// inicializarlo express
const app = express()

// obtener datos de la BD  """"""""""""""""""""""""""""""""""""""""""""""""""""""""
app.get('/usuario', (req, res) => {

    // paginar si no viene la pagina busca desde el primer registro(desde que registro quiero)
    let desde = req.query.desde || 0;
    // lo transfrma a número la variables desde
    desde = Number(desde);

    // Muestre de x paginas para mostrar registros, y se transforma en númerico(Cuanto registros quiero) 
    let limite = req.query.limite || 5;
    limite = Number(limite);

    // son comandos de mongoose, busca en la tabla usuarios de mongodb
    // skip=5 que se salte los primeros 5 y (limits)=despues me muestre los siguientes 5 registros
    // y despues exec
    //Usuario.find({ google: true })  // si se define aqui abajo tb, es para indicar condiciones(google:true)

    // visualizar solo los usuarios con estado activos
    Usuario.find({ estado: true }, 'nombre email role estado google img') // de esta manera podemos exluir algunos campos
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            // si hay un error muestra el mensaje y sale con el return
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            // Es para mostrar registros según condiciones google: true
            // Usuario.count({ google: true }, (err, conteo) => {
            // en la respuesta se puede indicar cuantos registros son seleccionados(count)
            Usuario.count({ estado: true }, (err, conteo) => {
                // respuesta
                res.json({
                    ok: true,
                    usuarios, // lo mismo que usuarios:usuarios
                    cuantos: conteo
                });
            });
        })
        //res.json('get usuario LOCAL!!')
})

// crear nuevo registro   """"""""""""""""""""""""""""""""""""""""""""""""""""""
app.post('/usuario', function(req, res) {
    //recibimos la informacion del post
    let body = req.body;
    // creamos u objeto usuario con todos los valores en Usuario que trae MONGOOSE
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        // hashSync=graba directamente en forma asincrona la encriptación en la password
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    // grabar en la BD, se define un error y la respuesta con los datos (save=reservada de MONGOOSE)
    usuario.save((err, usuarioDB) => {
        // si hay un error muestra el mensaje y sale con el return
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // muestra en el json o mensaje que password es null, asi no muestra el codigo encriptado
        //usuarioDB.password = null


        // Si esta ok(implicito status 200) la respuesta, devuelve los datos de la BD
        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});
/* para probar sin BD desde postman
    if (body.nombre === undefined) {
        // mensaje al desarrollador que consume nuestra api, 400 que faltan parametros
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });

    } else {}
    res.json({
        persona: body
    });
})  */

// actualizar nuevo registro  """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""2
app.put('/usuario/:id', (req, res) => {

    let id = req.params.id;
    // indica los campos que se van a validar
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    // cuando son pocos objetos y no queremos que se modifiquen se puede hacer de esa manera
    //delete body.password;
    //delete body.google;

    // en el callback recibimos un error o el usuario de la BD
    // { new: true} = nos devuelve el objeto actualizado en la impresión, pero si el programa requiere
    // los datos sin actualizarse por pantalla, se omite { new: true}
    // runValidators: true = es para validar que no se modifiquen los roles que no se encuentren en la BD
    // y todas las validaciones del esquema (error de mongodb) 
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        // si hay un error muestra el mensaje y sale con el return
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        // si esta ok
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })
});

// Borrar  registro  """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
app.delete('/usuario/:id', (req, res) => {
    // recupera el id desde la URL (la otra menera es desde body)
    let id = req.params.id; // es el id desde la url que esta arriba

    // elimina todo el registro con un delete  ****************
    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    // modifica el estado 
    let cambiaEstado = {
        estado: false
    };
    // el runValidators: true lo sacamos pq solo actualizamos 1 dato
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        // si hay un error muestra el mensaje y sale con el return
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Si no encontro el usuario, envio mensaje
        if (usuarioBorrado === null) { // tambien puede ser if (!usuarioBorrado)
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        // si esta ok
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});


module.exports = app;