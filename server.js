require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
});


/* 
CREATE TABLE sweepstake (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  school VARCHAR(255),
  dob DATE,
  phone VARCHAR(15),
  prize VARCHAR(255)
);
*/

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

app.get('/', (req, res) => {
  res.send('Bem-vindo ao meu servidor!');
});

app.post('/submit', (req, res) => {
  const { name, school, dob, phone, prize } = req.body;

  const query =
    'INSERT INTO sweepstake (name, school, dob, phone, prize) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, school, dob, phone, prize], (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados:', err);
      return res.status(500).json({ message: 'Erro ao inserir dados' });
    }
    res.status(200).json({ message: 'Dados inseridos com sucesso' });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
