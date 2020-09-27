const express = require('express');

let { verificaToken } = require('../middlewares/autentificacion.js');

let app = express();
let Producto = require('../models/producto');

//==================
// Monstrar todas las productos, con paginación
//==================
app.get('/producto', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    // lo transfrma a número la variables desde
    desde = Number(desde);

    // Muestre de x paginas para mostrar registros, y se transforma en númerico(Cuanto registros quiero) 
    let limite = req.query.limite || 5;
    limite = Number(limite);

    // trae todos los productos 
    // populate: usuario categoria
    // paginado
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
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
            Producto.count({ disponible: true }, (err, conteo) => {
                // respuesta
                res.json({
                    ok: true,
                    producto, // lo mismo que usuarios:usuarios
                    cuantos: conteo
                });
            });
        })

});


//===================================
// Monstrar un producto por ID
//===================================
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    // busco por ID  
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            // si hay un error de BD muestra el mensaje y sale con el return
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            // Si no viene un producto, pq no la encontro
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No existe un producto con ese ID'
                    }
                });
            }
            // si esta ok
            res.json({
                ok: true,
                producto: productoDB
            });
        })

});


//===================================
// Buscar productos 
//===================================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    // buscar por nommbre
    let termino = req.params.termino;
    // enviar una expresion regular, sensible a mayuscula y minuscula (i)
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex, disponible: true })
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            // si hay un error de BD muestra el mensaje y sale con el return
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            // si esta ok
            res.json({
                ok: true,
                productos: productoDB
            });
        });
});

//===================================
// CRear un nuevo producto 
//===================================
app.post('/producto', verificaToken, (req, res) => {
    let id = req.usuario._id; // id del usuario del token que viene en verificaToken
    // regresa la nueva categoria
    let body = req.body;
    // creamos un objeto categoria con todos los valores en Usuario que trae MONGOOSE
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precio,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: id // de la bd  usuario
    });
    // grabar en la BD, se define un error y la respuesta con los datos (save=reservada de MONGOOSE)
    producto.save((err, productoDB) => {
        // si hay un error de BD al momento de grabar muestra el mensaje y sale con el return
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // si no se crea la categoria muestra el mensaje del porque no y sale con el return
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Si esta ok(implicito status 201) la respuesta, devuelve los datos de la BD
        res.json({
            ok: true,
            producto: productoDB
        });

    });

});

//===================================
// Actualizar una nuevo producto
//===================================
app.put('/producto/:id', [verificaToken], (req, res) => {

    let id = req.params.id;
    // indica los campos que se van a validar
    let body = req.body;

    // { new: true} = nos devuelve el objeto actualizado en la impresión, pero si el programa requiere
    // los datos sin actualizarse por pantalla, se omite { new: true}
    // runValidators: true = es para validar que no se modifiquen los roles que no se encuentren en la BD
    // y todas las validaciones del esquema (error de mongodb) para que no se choquen las validacions
    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
        // si hay un error de BD al momento de grabar muestra el mensaje y sale con el return
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // si no existe un producto hay un error muestra el mensaje y sale con el return
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe un producto con ese ID'
                }
            });
        }
        // si esta ok
        productoDB.descripcion = body.descripcion;
        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precio;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        // actualizar o grabar los datos
        productoDB.save((err, productoGuardado) => {

            // si hay un error de BD al momento de grabar muestra el mensaje y sale con el return
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            // si esta ok
            res.json({
                ok: true,
                producto: productoGuardado
            });

        });

    })
});

//===================================
// Borrar una producto
//===================================
app.delete('/producto/:id', [verificaToken], (req, res) => {
    // Categoria.findByIdAndRemove
    let id = req.params.id; // es el id desde la url que esta arriba

    Producto.findById(id, (err, productoDB) => {
        // si hay un error muestra el mensaje y sale con el return
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si no encontro el usuario, envio mensaje
        if (!productoDB) { // tambien puede ser if (!usuarioBorrado)
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID de producto no encontrada'
                }
            });
        }
        // si esta ok
        productoDB.disponible = false;
        productoDB.save((err, productoEliminado) => {
            // si hay un error de BD al momento de grabar muestra el mensaje y sale con el return
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            // si esta ok
            res.json({
                ok: true,
                producto: productoEliminado,
                message: 'Producto borrado'
            });

        });

    });

});

module.exports = app;