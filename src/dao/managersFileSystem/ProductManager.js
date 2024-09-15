import fs from 'fs';
import path from 'path';
import __dirname from '../../../utils.js';

class ProductManager{

    constructor(){
        this.path = path.join(__dirname,'./data/products.json');
        this.products = [];
    }

    getProductsQuery = async (limit, page, sort, query) => {
        try {
            !limit && (limit = 10);
            !page && (page = 1);
            sort === 'asc' && (sort = 1);
            sort === 'des' && (sort = -1);
    
            const filter = query ? JSON.parse(query) : {};
    
            let products = await this.getProducts();
    
            if (Object.keys(filter).length > 0) {
                products = products.filter(product => {
                    for (let key in filter) {
                        if (product[key] !== filter[key]) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            if (sort) {
                products.sort((a, b) => sort * (a.price - b.price));
            }
    
            const totalPages = Math.ceil(products.length / limit);
            const start = (page - 1) * limit;
            const end = start + limit;
            products = products.slice(start, end);
    
            return {
                docs: products,
                totalDocs: products.length,
                limit: limit,
                totalPages: totalPages,
                page: page,
                pagingCounter: start + 1,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null
            };
        } catch (error) {
            console.log('Error al obtener productos con consulta:', error.message);
            return 'Error al obtener productos con consulta: ' + error.message;
        }
    }

    getProducts = async () => {
        try{
            const productsList = await fs.promises.readFile(this.path,"utf-8")
            const productsListParse = JSON.parse(productsList)
            return productsListParse
        }catch{
            return [];
        }
    }

    getProductById = async (productId) => {
        const products = await this.getProducts()
        for(const item of products){
            if(item._id === productId){
                return item;
            }
        }
        return 'Not found'
    }

    addProduct = async (obj) => {
        const {title, description, price, thumbnail, code, stock, category} = obj;
        if(!title || !description || !price || !thumbnail || !code || !stock || !category){
            console.error("ERROR: Datos del producto incompletos");
            return;
        }
        const productList = await this.getProducts();
        const product = {
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            category,
            status: true,
            owner: 'admin'
        }

        for( const item of productList){
            if(item.code === product.code){
                console.error('ERROR: Codigo existente');
                return
            }
        }
        
        if(productList.length === 0){
            product._id = 1
        }else{
            product._id = productList[productList.length -1]._id + 1;  
        }

        productList.push(product);

        await fs.promises.writeFile(this.path,JSON.stringify(productList,null,2))
    }

    updateProduct = async (productId , productUpdate) => {

        const pid = productId
        const {title, description, price, thumbnail, code, stock} = productUpdate

        if( !title || !description || !price || !thumbnail || !code || !stock){
          console.error("ERROR: Datos del producto incompletos")
          return 
        }
        
        const currentProductsList = await this.getProducts()

        for( const item of currentProductsList){
            if(item.code === code && item._id !== pid){ 
                console.error('ERROR: Codigo existente');
                return
            }
        }
        let newProductsList = currentProductsList.map(item => {
            if (item._id === pid) {
                const updatedProduct = {
                    _id: pid,
                    title,
                    description,
                    price,
                    thumbnail,
                    code,
                    stock,
                };
                return updatedProduct; 
            }else{
                return item;
            }     
           
        });

        await fs.promises.writeFile(this.path,JSON.stringify(newProductsList,null,2));
    }
            
    deleteProduct = async (searchId) => {
        const productsList = await this.getProducts();

        const existingCode = productsList.find(product =>product._id===searchId)
        if(!existingCode){
            console.error('ERROR: Codigo inexistente')
            return
        }

        const updatedProductsList = productsList.filter(product => product._id !== searchId); 
        await fs.promises.writeFile(this.path,JSON.stringify(updatedProductsList,null,2))
        console.log('Producto eliminado correctamente')
        return updatedProductsList;  
    }
}

export default ProductManager;

// //Test

// // Crea una nueva instancia de ProductManager.
// const productManager = new ProductManager(path.join(__dirname,'./data/products.json'));

// // Ahora puedes usar los métodos de la clase ProductManager.
// // Por ejemplo, para agregar un nuevo producto:

// const newProduct = {
//     title: 'Test Product',
//     description: 'This is a test product',
//     price: 99.99,
//     thumbnail: 'test.jpg',
//     code: 'testfesfsgdrgdr',
//     stock: 10,
//     category: 'PC'
// };

// const anotherProduct = {
//     title: 'Test Product 2',
//     description: 'This is a test product 2 ',
//     price: 99.99,
//     thumbnail: 'test.jpg',
//     code: 'test 255 ',
//     stock: 15,
//     category: 'PC'
// };

// productManager.addProduct(newProduct).then(() => console.log('Producto agregado'));
// productManager.addProduct(anotherProduct).then(() => console.log('Producto agregado'));

// // O para obtener todos los productos:
// productManager.getProducts().then(products => console.log(products));

// // O para obtener un producto por ID:
// productManager.getProductById(1).then(product => console.log(product));

// O para eliminar un producto por ID:
//productManager.deleteProduct(1).then(() => console.log('Producto eliminado'));




// const productManager = new ProductManager('./products.json');
// (async () => {

//     //=========array vacio=================

//     const noProducts = await productManager.getProducts();
//     console.log('All Products:', noProducts);


//     //===============metodo addProduct:===============

//     await productManager.addProduct(
//         'Monitor Asus',
//         'Monitor led 24" 75hz',
//         59.99,
//         'path/to/image1.jpg',
//         'PRD001',
//         100
//     );

//     await productManager.addProduct(
//         'Samsung Galaxy S23',
//         'nuevo con caja sellada',
//         800.50,
//         'path/to/image2.jpg',
//         'PRD002',
//         15
//     );

//     await productManager.addProduct(
//         'Monitor presonus eris 5',
//         'Monitores de estudio',
//         300.25,
//         'path/to/image2.jpg',
//         'PRD003',
//         28
//     );

//     await productManager.addProduct(
//         'Monitor samsung',
//         'Monitor led 32" 144hz',
//         59.99,
//         'path/to/image1.jpg',
//         'PRD004',
//         22
//     );

//     await productManager.addProduct(
//         'Samsung Galaxy S23 ultra',
//         'nuevo con caja sellada',
//         100.50,
//         'path/to/image2.jpg',
//         'PRD005',
//         93
//     );

//     await productManager.addProduct(
//         'Monitores kkr 10',
//         'Monitores de estudio',
//         300.25,
//         'path/to/image2.jpg',
//         'PRD006',
//         82
//     );

//     await productManager.addProduct(
//         'Teclado mecanico logitech',
//         'teclado con switch blue',
//         25,
//         'path/to/image2.jpg',
//         'PRD007',
//         500
//     );

//     await productManager.addProduct(
//         'Parlante JBL Go 4',
//         'Parlante inalambrico Hi-Fi',
//         30,
//         'path/to/image2.jpg',
//         'PRD008',
//         102
//     );

//     await productManager.addProduct(
//         'Go Pro Hero 9',
//         'Camara de accion',
//         30,
//         'path/to/image2.jpg',
//         'PRD009',
//         12
//     );

//     await productManager.addProduct(
//         'Traje neopren Oneil',
//         'traje grueso neopren',
//         200,
//         'path/to/image2.jpg',
//         'PRD010',
//         5
//     );

//     //============metodo getProducts:=============

//     const allProducts = await productManager.getProducts();
//     console.log('All Products:', allProducts);

//     //==========metodo getProductByID:============

//     const productById = await productManager.getProductById(2);
//     console.log('Product with ID 1:', productById);

//     //============metodo updateProduct:==============

//     await productManager.updateProduct(
//         3, 
//         'Iphone 14 pro max',
//         'Importado desde EE.UU',
//         999.99,
//         'algo',
//         '1223456987',
//         114,
//     );

//     const updatedProduct = await productManager.getProductById(3);
//     console.log('Updated Product:', updatedProduct);

//     // ==============metodo deleteproduct:===================

//     await productManager.deleteProduct(27);
//     const remainingProducts = await productManager.getProducts();
//     console.log('Remaining Products:', remainingProducts);

// })();
