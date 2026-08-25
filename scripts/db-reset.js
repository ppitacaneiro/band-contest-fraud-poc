require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function resetDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        multipleStatements: true
    });

    try {

        console.log('Reiniciando base de datos...');

        const schema = fs.readFileSync(
            path.join(__dirname, '../database/schema.sql'),
            'utf8'
        );

        const seed = fs.readFileSync(
            path.join(__dirname, '../database/seed.sql'),
            'utf8'
        );

        await connection.query(schema);
        await connection.query(seed);

        console.log('Base de datos reiniciada correctamente.');

    } catch (error) {

        console.error('Error reiniciando la base de datos:');
        console.error(error);

        process.exitCode = 1;

    } finally {

        await connection.end();

    }
}

resetDatabase();