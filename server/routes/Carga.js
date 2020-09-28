const express = require('express');
// middleware para subir archivos
const fileUpload = require('express-fileupload');
let app = express();

// grabar id unico
var uniqid = require('uniqid');

// Para poder grabar en la BD usuario, hay que rutear el esquema, para tener acceso a todo los 
// objetos del usuario
const Usuario = require('../models/usuario.js');
const Producto = require('../models/producto.js');
// Para verificar si grabo un archivo, especificar fs y el path, no hay que hacer install existen en node
const fs = require('fs');
const path = require('path');

// carga los archivos y se puede ocupar los archivos como .files
app.use(fileUpload({ useTempFiles: true }));

// Creemos nuestra primera ruta que permita a los usuarios subir o cargar archivos
app.put('/uploads/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    //""""""""""""""""""""""""""""""""""""""""""""""""
    // Validar tipo de archivo que se pueden cargar
    //"""""""""""""""""""""""""""""""""""""""""""""""
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(500).json({
            ok: false,
            err: {
                // join concatena el mensaje con el arreglo y los separa con una coma y espacio
                message: 'Los tipos permitidas son ' + tiposValidos.join(', '),
            }
        });
    }

    // Si no encuentra el archivo mensaje de error 
    console.log(req.files);
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado Ningún archivo'
            }
        });
    }
    //""""""""""""""""""""""""""""""""""""""""""""""""""""
    // Extensiones permitidas
    //"""""""""""""""""""""""""""""""""""""""""""""""""""" 
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // Si encontro el archivo
    ///Utilice el nombre del campo de entrada (en el BODY, "archivo") para recuperar el archivo cargado
    let archivo = req.files.archivo; // desde el body en form-data (archivos grandes o imagenes)
    // separa el nombre del archivo y su extensiòn  por punto
    let nombreCortado = archivo.name.split('.');
    // obtener la ultima posiciòn del archivo, en este caso la extensiòn
    let extension = nombreCortado[nombreCortado.length - 1]; //let extension = partesNombreArchivo.pop();
    //console.log(nombreArchivo);
    console.log(extension);

    // Si no encontro la extensiòn en el arreglo
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(500).json({
            ok: false,
            err: {
                // join concatena el mensaje con el arreglo y los separa con una coma y espacio
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });

    };

    // Cambiar el nombre del archivo, ya viene el id y procurar que sea unico
    // let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // grabo un id unico concatenado con ID y la extensión
    let nombreArchivo = uniqid(`${id}-`, `.${extension}`);
    //console.log(nombreArchivo);

    // Descargar con mv  archivo en el path destino // (archivo.name=nombre de la foto origial)!!!!!
    //archivo.mv('./uploads/' + tipo + '/' + archivo.name, function(err) {
    archivo.mv('./uploads/' + tipo + '/' + nombreArchivo, function(err) {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });
        CargaImagen(id, res, nombreArchivo, tipo)
            // aqui ya esta la imagen cargada
            //if (tipo === 'usuarios') {
            //    imagenUsuario(id, res, nombreArchivo);
            //} else {
            //    imagenProducto(id, res, nombreArchivo);
            //}

    });
});

// imagen usuario (id y la respuesta) como parametros y el nuevo nombre de archivo
function imagenUsuario(id, res, nombreArchivo) {
    // 1° si existe el usuario que quiero actualizar existe
    Usuario.findById(id, (err, usuarioDB) => {
        // si hay un error en la BD
        if (err) {
            // Aunque haya un error necesito borrar la imagen actual, pq ya se cargó
            // asi no se carga el servidor con basura
            borrarArchivo(nombreArchivo, 'usuarios')
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Error interno, en la BD, o en el registro, etc...'
                }
            });
        }
        // Si no encontró el usuario
        if (!usuarioDB) {
            // Aunque haya un error necesito borrar la imagen actual, pq ya se cargó
            borrarArchivo(nombreArchivo, 'usuarios')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe con ID'
                }
            });
        }
        // Verificar que la imagen existe antes de borrar la imagen
        // 1° indicar el path, no es nombreArchivo pq es el nuevo, debe ser el anterior
        /* let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${usuarioDB.img}`);
         // 2° confirmar si ese path existe y si es asi borrarla, fs.existsSync=indica true o false
         if (fs.existsSync(pathImagen)) {
             fs.unlinkSync(pathImagen);
         }*/

        // para borrar se envia la nombre de la imagen anterior y el tipo(usuario o producto)
        // Todo esto Para que no se repita en el servidor si se sube el mismo archivo 
        borrarArchivo(usuarioDB.img, 'usuarios')

        // Si esta todo ok y Si existe el usuario en la BD, se graba la imagen y se imprime en la BD
        usuarioDB.img = nombreArchivo;

        // grabar
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })

        });

    });


}

// imagen producto
function imagenProducto(id, res, nombreArchivo) {

    // 1° si existe el producto se graba
    Producto.findById(id, (err, productoDB) => {
        // si hay un error en la BD
        if (err) {
            // Aunque haya un error necesito borrar la imagen actual, pq ya se cargó
            // asi no se carga el servidor con basura
            borrarArchivo(nombreArchivo, 'productos')
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Error interno, en la BD, o en el registro, etc...'
                }
            });
        }
        // Si no encontró el producto
        if (!productoDB) {
            // Aunque haya un error necesito borrar la imagen actual, pq ya se cargó
            borrarArchivo(nombreArchivo, 'productos')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Prodcuto no existe con ID'
                }
            });
        }

        // para borrar se envia la nombre de la imagen anterior y el tipo(usuario o producto)
        // Todo esto Para que no se repita en el servidor si se sube el mismo archivo 
        borrarArchivo(productoDB.img, 'productos')

        // Si esta todo ok y Si existe el producto en la BD, se graba la imagen y se imprime en la BD
        productoDB.img = nombreArchivo;
        // grabar
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                img: nombreArchivo,
                producto: productoGuardado,
                message: 'Prodcuto cargado en servidor'
            })
        });
    });

}

function borrarArchivo(nombreImagen, tipo) {

    // Verificar que la imagen existe antes de borrar la imagen
    // 1° indicar el path, no es nombreArchivo pq es el nuevo, debe ser el anterior
    //let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${usuarioDB.img}`);
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    // 2° confirmar si ese path existe y si es asi borrarla, fs.existsSync=indica true o false
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
};

// Cargar y grabar usuarios o productos segun parametros(reemplaza a las 2 funciones)
function CargaImagen(id, res, nombreArchivo, tipo) {
    // aqui ya esta la imagen cargada
    if (tipo === 'usuarios') {
        esquemaUsar = Usuario; //models
    } else {
        esquemaUsar = Producto;
    }
    // 1° si existe el usuario o producto se graba
    esquemaUsar.findById(id, (err, esquemaDB) => {
        // si hay un error en la BD
        if (err) {
            // Aunque haya un error necesito borrar la imagen actual, pq ya se cargó
            // asi no se carga el servidor con basura
            borrarArchivo(nombreArchivo, tipo)
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Error interno, en la BD, o en el registro, etc...'
                }
            });
        }
        // Si no encontró el producto
        if (!esquemaDB) {
            // Aunque haya un error necesito borrar la imagen actual, pq ya se cargó
            borrarArchivo(nombreArchivo, tipo)
            return res.status(400).json({
                ok: false,
                err: {
                    message: `${tipo} no existe con ese ID en la BD`
                }
            });
        }

        // para borrar se envia la nombre de la imagen anterior y el tipo(usuario o producto)
        // Todo esto Para que no se repita en el servidor si se sube el mismo archivo 
        borrarArchivo(esquemaDB.img, tipo)

        // Si esta todo ok y Si existe el producto en la BD, se graba la imagen y se imprime en la BD
        esquemaDB.img = nombreArchivo;
        // grabar
        esquemaDB.save((err, esquemaGuardado) => {
            res.json({
                ok: true,
                img: nombreArchivo,
                producto: esquemaGuardado,
                message: `${tipo} cargado en servidor y grabado en la BD`
            })
        });
    });

}

module.exports = app;