const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'aura',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log("Dropping foreign key...");
        try {
            await db.query(`ALTER TABLE paquetes DROP FOREIGN KEY paquetes_ibfk_2`);
        } catch (e) {
            console.log("FK already dropped or error: " + e.message);
        }

        console.log("Altering IDServicio to VARCHAR...");
        await db.query(`ALTER TABLE paquetes MODIFY COLUMN IDServicio VARCHAR(255)`);
        
        console.log("Adding IDCabana...");
        try {
            await db.query(`ALTER TABLE paquetes ADD COLUMN IDCabana INT`);
        } catch (e) {
            console.log("IDCabana already exists or error: " + e.message);
        }

        console.log("Adding Descuento...");
        try {
            await db.query(`ALTER TABLE paquetes ADD COLUMN Descuento DECIMAL(10,2) DEFAULT 0`);
        } catch (e) {
            console.log("Descuento already exists or error: " + e.message);
        }

        console.log("Adding TipoDescuento...");
        try {
            await db.query(`ALTER TABLE paquetes ADD COLUMN TipoDescuento VARCHAR(50) DEFAULT 'porcentaje'`);
        } catch (e) {
            console.log("TipoDescuento already exists or error: " + e.message);
        }

        console.log("Adding Foreign Key for IDCabana...");
        try {
            await db.query(`ALTER TABLE paquetes ADD FOREIGN KEY (IDCabana) REFERENCES cabanas(IDCabana)`);
        } catch (e) {
            console.log("Foreign Key already exists or error: " + e.message);
        }

        console.log("Creating detallereservacabana table if it doesn't exist...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS detallereservacabana (
                IDReserva INT,
                IDCabana INT,
                Cantidad INT DEFAULT 1,
                Precio DECIMAL(10,2),
                Estado INT DEFAULT 1,
                PRIMARY KEY (IDReserva, IDCabana),
                FOREIGN KEY (IDReserva) REFERENCES reserva(IdReserva),
                FOREIGN KEY (IDCabana) REFERENCES cabanas(IDCabana)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log("Creating detallereservaservicio table if it doesn't exist...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS detallereservaservicio (
                IDReserva INT,
                IDServicio INT,
                Cantidad INT DEFAULT 1,
                Precio DECIMAL(10,2),
                Estado INT DEFAULT 1,
                PRIMARY KEY (IDReserva, IDServicio),
                FOREIGN KEY (IDReserva) REFERENCES reserva(IdReserva),
                FOREIGN KEY (IDServicio) REFERENCES servicios(IDServicio)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log("Creating detallereservahabitacion table if it doesn't exist...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS detallereservahabitacion (
                IDReserva INT,
                IDHabitacion INT,
                Cantidad INT DEFAULT 1,
                precio DECIMAL(10,2),
                Estado INT DEFAULT 1,
                PRIMARY KEY (IDReserva, IDHabitacion),
                FOREIGN KEY (IDReserva) REFERENCES reserva(IdReserva),
                FOREIGN KEY (IDHabitacion) REFERENCES habitacion(IDHabitacion)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log("Success!");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await db.end();
    }
}

run();
