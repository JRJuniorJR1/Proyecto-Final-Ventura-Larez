import  {Router}  from "express";
import __dirname from "../../utils.js";
import { 
	getProducts, 
	getProductsInRealTime, 
	chatStyle, 
	pagination, 
	cartView, 
	redirection, 
	loginView , 
	registerView , 
	profileView, 
	resetPasswordView,
	newPasswordView,
	uploadDocumentView,
	purchaseView,
	usersAdminManager
} from "../controllers/viewsController.js";
import { applyPolicy,  privateAccess, redirectAdmin ,sessionExist ,publicAccess } from "../middlewares/authMiddleware.js";
import { passportCall , passportCallForHome} from "../../utils.js";



const router = Router();


router.get('/home',passportCallForHome('jwt'), sessionExist , applyPolicy(['PUBLIC']), getProducts );

router.get("/products",passportCall('jwt'), redirectAdmin, applyPolicy(['USER' , 'PREMIUM']), pagination );

router.get('/realtimeproducts' ,passportCall('jwt'), applyPolicy(['ADMIN' , 'PREMIUM']), getProductsInRealTime );

router.get('/carts/:cid',passportCall('jwt'), cartView );

router.get('/carts/:cid/purchase', passportCall('jwt'),applyPolicy(['USER' , 'PREMIUM']), privateAccess, purchaseView);

router.get("/chat",passportCall('jwt'),applyPolicy(['USER' , 'PREMIUM']), chatStyle );


router.get('/', redirection);

router.get('/login',passportCallForHome('jwt'), sessionExist , loginView);

router.get('/register',passportCallForHome('jwt'), sessionExist , registerView);

router.get('/resetpassword', resetPasswordView);

router.get('/newpassword/:pid', newPasswordView);

router.get('/api/users/:uid/documents', passportCall('jwt'),applyPolicy(['USER' , 'PREMIUM']), privateAccess, uploadDocumentView);

router.get('/profile', passportCall('jwt'),applyPolicy(['USER' , 'PREMIUM']), privateAccess, profileView);

router.get('/usersadminmanager', passportCall('jwt'),applyPolicy(['ADMIN']), privateAccess, usersAdminManager);

export default router;



//FILE SYSTEM

//ya no usaremos file system, usaremos mongoDB
//import ProductManager from "../ProductManager.js";

// Creación de una instancia de ProductManager con la ruta al archivo JSON de productos en caso de utilizar File System.
//const pmanager = new ProductManager(__dirname +'/files/products.json')

