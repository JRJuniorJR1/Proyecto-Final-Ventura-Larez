import mongoose from 'mongoose';
import { productModel } from '../../src/models/product.model.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// BASE DE DATOS
mongoose.connect('', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const filePath = join(__dirname, 'productos.json');

const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));

productModel.insertMany(products)
    .then(() => {
        console.log('Productos insertados con éxito');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error al insertar productos:', err);
        mongoose.connection.close();
    });
