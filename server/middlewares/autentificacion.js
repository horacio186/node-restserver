const jwt = require('jsonwebtoken');

//===========================
//  Verificar Token
//===========================

// Si no se ejecuta el next nunca realiza el codigo a continuación del middlewares
let verificaToken = (req, res, next) => {

    let token = req.get('token'); // nombre que se pone en el HEADERS

    // process.env.SEED = semilla, variable de entorno global (config.js)
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        // si hay un error muestra el mensaje y sale con el return
        // error 401 no autorizado
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        // Si esta ok
        // decoded contiene la información del usuario, --> Esto es el payload
        req.usuario = decoded.usuario; // información de toda la BD
        next();
    });
    //console.log(token);
    //res.json({
    //  token: token
    //});
};

//===========================
//  Verificar AdminRole
//===========================
let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
}


module.exports = {

    verificaToken,
    verificaAdmin_Role
}