// configura todo lo que hay en el archivo, principalmente el puerto
require('./config/config');

const express = require('express')
const app = express()

const bodyParser = require('body-parser')

//agregar un analizador genérico de JSON y con codificación URL
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// obtener datos
app.get('/usuario', (req, res) => {
    res.json('get usuario')

})

// crear nuevo registro
app.post('/usuario', (req, res) => {

    let body = req.body;

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
})

// actualizar nuevo registro
app.put('/usuario/:id', (req, res) => {

    let id = req.params.id;
    res.json({
        id
    });
});

// crear nuevo registro
app.delete('/usuario', (req, res) => {
    res.json('delete usuario')

})


app.listen(process.env.PORT, () => {

    console.log('Escuchando puerto: ', process.env.PORT);
});