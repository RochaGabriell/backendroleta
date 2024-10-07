import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function connectDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
    });
    console.log('Conectado ao banco de dados MySQL');
    return connection;
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    throw err;
  }
}

async function main() {
  try {
    let db = await connectDB();
    
    app.get('/', (req, res) => {
      res.send('Bem-vindo ao meu servidor!');
    });

    app.post('/submit', async (req, res) => {
      const { name, school, dob, phone, prize } = req.body;

      // // Validação básica dos campos
      // if (!name || !school || !dob || !phone || !prize) {
      //   return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
      // }

      try {
        const [result] = await db.execute(
          'INSERT INTO sweepstake (name, school, dob, phone, prize) VALUES (?, ?, ?, ?, ?)',
          [name, school, dob, phone, prize]
        );
        res.status(201).json({ message: 'Dados inseridos com sucesso', id: result.insertId });
      } catch (err) {
        console.error('Erro ao inserir dados:', err);
        res.status(500).json({ message: 'Erro ao inserir dados' });
      }
    });

    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

main();