//===========================
// Puerto
//===========================
process.env.PORT = process.env.PORT || 3000;

//===========================
// Entorno
//===========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//===========================
// Vencimiento del Token
//===========================
// 60 segundo
// 60 minutos
// 24 horas
// 30 dias
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//===========================
// SEED de autenticación del TOKEN, configuramos una variable de entorno de heroku para producción
//===========================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

//===========================
// Base de datos, configuramos una variable de entorno heroku para producción
//===========================
let urlDB;

// si es igual a desarrollo o productivo
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//===========================
// GOOGLE CLIENT ID
//===========================}

process.env.CLIENT_ID = process.env.CLIENT_ID || 'adept-mountain-290421.apps.googleusercontent.com';