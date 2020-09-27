const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autentificacion.js');

let app = express();

let Categoria = require('../models/categoria');


//==================
// Monstrar todas las categoria
//==================
app.get('/categoria', verificaToken, (req, res) => {
    // visualizar solo los usuarios con estado activos
    // populate= cargar informacion de otras tablas, todo o algunos campos, se
    // puede agregar varios populate
    // sort: ordenar los datos
    Categoria.find() // de esta manera podemos exluir algunos campos
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            // si hay un error en BD muestra el mensaje y sale con el return
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            // Es para mostrar registros según condiciones google: true
            // Usuario.count({ google: true }, (err, conteo) => {
            // en la respuesta se puede indicar cuantos registros son seleccionados(count)
            Categoria.count({ estado: true }, (err, conteo) => {
                // respuesta
                res.json({
                    ok: true,
                    categorias, // lo mismo que usuarios:usuarios
                    cuantos: conteo
                });
            });
        })

})




//===================================
// Monstrar una categoria del usuario
//===================================
app.get('/categoria/:id', verificaToken, (req, res) => {
    // Categoria.findById();
    let id = req.params.id;
    // busco por ID  
    Categoria.findById(id, (err, categoriaDB) => {
        // si hay un error de BD muestra el mensaje y sale con el return
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // Si no viene una categoria, pq no la encontro
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe categoria con ese ID'
                }
            });
        }
        // si esta ok
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })

});


//===================================
// CRear una nueva categoria 
//===================================
app.post('/categoria', verificaToken, (req, res) => {
    let id = req.usuario._id; // id del usuario del token que viene en verificaToken
    // regresa la nueva categoria
    let body = req.body;
    // creamos un objeto categoria con todos los valores en Usuario que trae MONGOOSE
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: id
    });
    // grabar en la BD, se define un error y la respuesta con los datos (save=reservada de MONGOOSE)
    categoria.save((err, categoriaDB) => {
        // si hay un error de BD al momento de grabar muestra el mensaje y sale con el return
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // si no se crea la categoria muestra el mensaje del porque no y sale con el return
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Si esta ok(implicito status 200) la respuesta, devuelve los datos de la BD
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

//===================================
// Actualizar una nueva categoria 
//===================================
app.put('/categoria/:id', [verificaToken], (req, res) => {

    let id = req.params.id;
    // indica los campos que se van a validar
    let body = req.body;
    let descCategoria = {
        descripcion: body.descripcion
    }

    // { new: true} = nos devuelve el objeto actualizado en la impresión, pero si el programa requiere
    // los datos sin actualizarse por pantalla, se omite { new: true}
    // runValidators: true = es para validar que no se modifiquen los roles que no se encuentren en la BD
    // y todas las validaciones del esquema (error de mongodb) para que no se choquen las validacions
    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        // si hay un error de BD al momento de grabar muestra el mensaje y sale con el return
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // si hay un error muestra el mensaje y sale con el return
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        // si esta ok
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

//===================================
// Borrar una categoria 
//===================================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // Categoria.findByIdAndRemove
    let id = req.params.id; // es el id desde la url que esta arriba

    Categoria.findByIdAndRemove(id, (err, categoriaBorrado) => {
        // si hay un error muestra el mensaje y sale con el return
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si no encontro el usuario, envio mensaje
        if (!categoriaBorrado) { // tambien puede ser if (!usuarioBorrado)
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID de Categoria no encontrada'
                }
            });
        }
        // si esta ok
        res.json({
            ok: true,
            message: 'Categoria Borrada'
        });
    });

});

module.exports = app;