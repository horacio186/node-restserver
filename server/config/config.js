//===========================
// Puerto
//===========================
process.env.PORT = process.env.PORT || 3000;

//===========================
// Entorno
//===========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//===========================
// Base de datos
//===========================
let urlDB;

// si es igual a desarrollo o productivo
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://horacio:AhnFfkqeMVN1NPbj@cluster0.ru2cw.mongodb.net/cafe?retryWrites=true&w=majority';
}

process.env.URLDB = urlDB;