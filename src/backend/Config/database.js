const dotenv = require('dotenv');
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const mysql = require('mysql');
const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
  if (err) {
    console.error('Erro de conexão ao MySQL:', err);
  } else {
    console.log('Conectado ao MySQL');
  }
});