import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

async function getConnection(maxRetries = 3, retryDelay = 5000) {
  let retries = 0;
  while (retries <= maxRetries) {
    try {
      return await pool.getConnection();
    } catch (err) {
      console.error(
        `Erro ao obter conexão (tentativa ${retries + 1}/${maxRetries}):`,
        err
      );
      retries++;

      if (retries > maxRetries) {
        throw new Error('Falha ao obter conexão após múltiplas tentativas');
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

// Função para liberar uma conexão de volta ao pool
function releaseConnection(connection) {
  if (connection) {
    connection.release();
  }
}

async function main() {
  try {
    const testConnection = await getConnection();
    console.log('Conectado ao banco de dados MySQL');
    releaseConnection(testConnection);

    app.get('/', (req, res) => {
      res.send('Bem-vindo ao meu servidor!');
    });

    app.post('/submit', async (req, res) => {
      const { name, school, dob, phone, prize } = req.body;

      try {
        const connection = await getConnection();

        const [result] = await connection.execute(
          'INSERT INTO sweepstake (name, school, dob, phone, prize) VALUES (?, ?, ?, ?, ?)',
          [name, school, dob, phone, prize]
        );

        releaseConnection(connection);

        res.status(201).json({
          message: 'Dados inseridos com sucesso',
          id: result.insertId,
        });
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
