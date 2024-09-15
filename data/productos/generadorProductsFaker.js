import { fakerES as faker } from '@faker-js/faker';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const numProducts = 1000;
const products = [];

const imageBaseUrl = 'https://picsum.photos/200';

const categories = [
    'Ropa', 'Electrónicos', 'Accesorios', 'Calzado', 'Hogar', 'Juguetes'
];

for (let i = 0; i < numProducts; i++) {
    const category = faker.helpers.arrayElement(categories);
    let title, description;

    switch (category) {
        case 'Electrónicos':
            title = faker.commerce.productName(); // Producto electrónico
            description = faker.commerce.productDescription(); // Descripción de producto
            break;
        case 'Ropa':
        case 'Calzado':
            title = faker.commerce.productName(); // Nombre de producto
            description = faker.lorem.sentence(); // Descripción de producto
            break;
        case 'Accesorios':
            title = faker.lorem.words(); // Nombre de accesorio
            description = faker.lorem.sentence(); // Descripción de accesorio
            break;
        case 'Hogar':
            title = `Artículo de hogar ${faker.lorem.words()}`; // Artículo de hogar
            description = faker.lorem.sentence(); // Descripción de hogar
            break;
        case 'Juguetes':
            title = faker.lorem.words(); // Nombre de juguete
            description = `Juguete para niños: ${faker.lorem.sentence()}`; // Descripción de juguete
            break;
        default:
            title = faker.lorem.words(); // Nombre genérico
            description = faker.lorem.sentence(); // Descripción genérica
            break;
    }

    products.push({
        title: title,
        description: description,
        price: parseFloat(faker.commerce.price()),
        thumbnail: `${imageBaseUrl}?random=${i}`, // Genera una URL única para cada imagen
        code: faker.string.uuid(),
        stock: faker.number.int({ min: 1, max: 100 }),
        category: category,
        status: faker.datatype.boolean(),
        owner: 'admin'
    });
}

const filePath = join(__dirname, 'productos.json');
fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
console.log('Productos generados y guardados en', filePath);
