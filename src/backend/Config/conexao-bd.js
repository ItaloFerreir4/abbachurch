require('dotenv').config();

// Configurações da conexão com o banco de dados
const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};

module.exports = config;