const { Pool } = require("pg");
require('dotenv').config();

const SQL = `
DROP TABLE IF EXISTS Item_Supplier CASCADE;
DROP TABLE IF EXISTS Supplier CASCADE;
DROP TABLE IF EXISTS Item CASCADE;
DROP TABLE IF EXISTS Category CASCADE;

CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Item (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES Category(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) CHECK (price >= 0),
    stock INTEGER CHECK (stock >= 0),
    brand VARCHAR(100),
    model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Supplier (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    contact_info VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Item_Supplier (
    item_id INTEGER REFERENCES Item(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES Supplier(id) ON DELETE CASCADE,
    supply_price DECIMAL(10, 2) CHECK (supply_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (item_id, supplier_id)
);

INSERT INTO Category (name, description) VALUES
('String', 'Instruments that produce sound through vibrating strings'),
('Wind', 'Instruments that produce sound through air vibration'),
('Percussion', 'Instruments that produce sound through striking or shaking'),
('Keyboard', 'Instruments featuring a set of keys'),
('Electronic', 'Electronic instruments and sound equipment');

INSERT INTO Item (name, description, category_id, price, stock, brand, model) VALUES
('Acoustic Guitar', 'Six-string wooden guitar', 1, 299.99, 25, 'Fender', 'CD-60'),
('Electric Guitar', 'Solid body electric guitar', 1, 549.99, 15, 'Gibson', 'Les Paul Studio'),
('Violin', 'Classic 4/4 size violin', 1, 199.99, 10, 'Stentor', 'Student II'),
('Alto Saxophone', 'Brass alto saxophone', 2, 799.99, 8, 'Yamaha', 'YAS-280'),
('Clarinet', 'Wooden Bb clarinet', 2, 399.99, 12, 'Buffet Crampon', 'E11'),
('Trumpet', 'Brass Bb trumpet', 2, 599.99, 10, 'Bach', 'TR300H2'),
('Drum Kit', '5-piece drum set with cymbals', 3, 699.99, 5, 'Pearl', 'Roadshow'),
('Cajon', 'Peruvian box-shaped percussion instrument', 3, 99.99, 20, 'Meinl', 'Headliner'),
('Digital Piano', '88-key weighted digital piano', 4, 799.99, 7, 'Yamaha', 'P-125'),
('Synthesizer', 'Polyphonic synthesizer', 4, 1299.99, 6, 'Roland', 'JUNO-DS61'),
('Electric Drum Kit', 'Electronic drum set', 5, 899.99, 4, 'Alesis', 'Nitro Mesh'),
('Audio Interface', '2-channel USB audio interface', 5, 149.99, 15, 'Focusrite', 'Scarlett 2i2');

INSERT INTO Supplier (name, contact_info, address) VALUES
('MusicWorld', 'contact@musicworld.com', '123 Harmony Street, Melody City, MC 12345'),
('Instrument Imports', 'sales@instrumentimports.com', '456 Rhythm Avenue, Beat Town, BT 67890'),
('SoundGear Pro', 'info@soundgearpro.com', '789 Tempo Lane, Chord City, CC 54321'),
('Global Music Supply', 'support@globalmusicsupply.com', '321 Acoustic Road, Fret Village, FV 98765'),
('Maestro Distributors', 'orders@maestrodistributors.com', '654 Symphony Boulevard, Scale City, SC 13579');

INSERT INTO Item_Supplier (item_id, supplier_id, supply_price) VALUES
(1, 1, 200.00),
(1, 2, 210.00),
(2, 1, 400.00),
(2, 3, 420.00),
(3, 2, 150.00),
(4, 4, 600.00),
(5, 4, 300.00),
(6, 1, 450.00),
(7, 3, 500.00),
(8, 5, 70.00),
(9, 2, 600.00),
(10, 3, 1000.00),
(11, 5, 700.00),
(12, 4, 100.00);`

async function main() {
  let pool;
  try {
    console.log("Seeding...");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    await pool.connect();
    console.log("Connected to database");
    await pool.query(SQL);
    console.log("Seeded");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await pool.end();
    console.log("Done");
  }
}

main();