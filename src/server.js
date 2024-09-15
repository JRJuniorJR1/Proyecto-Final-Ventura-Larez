import express from "express";
import __dirname from "../utils.js";
import handlebars from 'express-handlebars';
import { Server } from "socket.io";
import mongoose, { connect } from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
// Importamos las rutas:
import productsRouter from './routers/products.router.js'; 
import cartsRouter from './routers/carts.router.js';
import sessionRouter from './routers/sessions.router.js';
import mockingRouter from './routers/mocking.router.js'
import mailingRouter from './routers/mailing.router.js'
import loggerRouter from './routers/logger.router.js'
import usersRouter from './routers/users.router.js'
import viewsRouter from './routers/views.router.js';

import passport from "passport";
import initializePassport from "./config/passport.config.js";

//Importamos los modelos de datos de producto y mensajes desde archivos separados.En este caso con mongoDB:
//Import productService from "./productService.js"; //CON FILE SYSTEM
import { productService } from "./services/index.js";
import { messageService } from "./services/index.js";
import { userService } from "./services/index.js";

import config from './config/config.js';

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";


const app = express()

const port = config.PORT || 8080;
const httpServer = app.listen( port , () => {console.log('Server ON in port:', config.PORT)})

const socketServer = new Server(httpServer);

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentacion Tienda 5PHNX',
            description: 'API pensada para aplicacion de un Marketplace'
        }
    },
    apis: [`${__dirname}/src/docs/**/*.yaml`]
}

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs',swaggerUiExpress.serve, swaggerUiExpress.setup(specs))


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.Router());

//Conexion a mongo Atlas:
//mongoose.connect(config.MONGO_URL)
mongoose.connect(process.env.MONGO_URL)


app.use(session({
    store: MongoStore.create({
        mongoUrl: config.MONGO_URL,
        ttl:3600
    }),
    // Establezco una clave secreta para firmar las cookies de sesión (debe ser una cadena segura):
    secret: 'severus23',
    // No vuelvas a guardar la sesión si no ha cambiado desde la última vez que se guardó:
    resave: false,
    // No guardar una sesión si no se ha inicializado (para ahorrar espacio en la base de datos):
    saveUninitialized: false
}))

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());

app.use('/static' , express.static(__dirname +'/src/public'));

app.engine('handlebars' , handlebars.engine());
app.set('views', __dirname + '/src/views');
app.set('view engine', 'handlebars');

//Rutas utilizadas:

app.use('/api/products' , productsRouter);
app.use('/api/carts' , cartsRouter);
app.use('/api/sessions', sessionRouter);
app.use('/mocking' , mockingRouter);
app.use('/mail', mailingRouter);
app.use('/loggerTest', loggerRouter );
app.use('/api/users' , usersRouter);
app.use('/', viewsRouter);


socketServer.on('connection', async (socket) => {

    console.log("nuevo cliente conectado")

    const products = await productService.getProducts()
    socket.emit('productos', products);

    //#ADD PRODUCT:
    //recibimos informacion del cliente, en este caso un nuevo producto y lo agregamos a nuestra base de datos. 
    socket.on('addProduct', async data => {

        // const product = data.product;
        // const userId = data.userId;
        // const userRole = data.userRole

        // //caso que el administrador quiera crear un producto
        // if (!userId && userRole === 'admin') {
        //     await productService.addProduct(product)
        //     const updateProductsList = await productService.getProducts();
        //     socket.emit('updatedProducts', updateProductsList ); //le enviamos al cliente la lista de productos actualizada con el producto que anteriormente agrego. 
        //     socket.emit('productAdded'); //para el manejo de alertas
        //     return;
        // }
        
        // //caso que un usuario cree un producto
        // const user = await userService.getUserById(userId);
        // if(user) product.owner = user._id

        // await productService.addProduct(product)
        // const updateProductsList = await productService.getProducts();
        // socket.emit('updatedProducts', updateProductsList ); //le enviamos al cliente la lista de productos actualizada con el producto que anteriormente agrego. 
        // socket.emit('productAdded'); //para el manejo de alertas

        const updateProductsList = await productService.getProducts();
        socket.emit('updatedProducts', updateProductsList ); //le enviamos al cliente la lista de productos actualizada con el producto que anteriormente agrego. 
        socket.emit('productAdded'); //para el manejo de alertas
    })

    socket.on('updateProduct', async (productData, userData) => {
        const idProduct = productData._id;
        delete productData._id;

        const product = await productService.getProductById(idProduct);
    
        if (userData.role === 'admin' || product.owner === userData._id) {

            await productService.updateProduct(idProduct, { $set: productData });
    
            const updateProductsList = await productService.getProducts();
            socket.emit('updatedProducts', updateProductsList );
            socket.emit('productUpdated');
        } else {
            socket.emit('error',  'No tienes permiso para actualizar este producto.' );
        }
    });


    //#DELETE PRODUCT:
    //recibimos del cliente el id del producto a eliminar
    socket.on('deleteProduct', async (productId , userData) => {

        const updateProducts = await productService.getProducts(); //obtenemos la lista actualizada con el producto eliminado
        socket.emit('updatedProducts', updateProducts ); //le enviamos al cliente la lista actualizada

        // // Obtenemos el producto
        // const product = await productService.getProductById(productId);

        // if (product === null) {
        //     socket.emit('error', 'Producto no encontrado');
        // }
        // // Verificamos si el usuario es el propietario del producto o si es admin
        // else if (userData.role === 'admin' || product.owner === userData._id) {
        //     await productService.deleteProduct(productId); //eliminamos el producto
        //     const updateProducts = await productService.getProducts(); //obtenemos la lista actualizada con el producto eliminado
        //     socket.emit('updatedProducts', updateProducts ); //le enviamos al cliente la lista actualizada
        //     socket.emit('productDeleted')//para el manejo de alertas
        // } else {
        //     socket.emit('error', 'No tienes permiso para eliminar este producto');
        // }
    })

})


//websockets para el chat:

socketServer.on('connection', async (socket) => {
    console.log("Nuevo cliente conectado");

    socket.on('authenticated', async (user) => {
        console.log(user);

        const messages = await messageService.getMessages(); // Obtener todos los mensajes de la base de datos
        socket.emit('messageLogs', messages); // Enviar los mensajes al cliente

        // Informar a otros clientes que un nuevo usuario se ha conectado
        socket.broadcast.emit('newUserConnected', user);
    });

    // Recibimos el usuario con su mensaje
    socket.on('message', async (data) => {
        console.log(data);
        await messageService.addMessages(data);
        const messages = await messageService.getMessages();
        socketServer.emit('messageLogs', messages);
    });
});

export default app;
