import { Router } from "express"
import passport from "passport";
import { 
    register, 
    failRegister, 
    loginSession,
    loginJWT,
    gitHubCallBack, 
    failLogin, 
    logOutJwt,
    logOutSession,
    resetPassword,
    newPassword
} from "../controllers/sessionsController.js";
import { passportCall} from "../../utils.js";
import { applyPolicy } from "../middlewares/authMiddleware.js";
import { addLogger } from '../utils/logger.js';
import userDTO from "../dao/DTOs/userDTO.js";

const router = Router()

router.use(addLogger);


router.post('/register' , passport.authenticate('register',{session:false, failureRedirect:'/failregister'}), register);

router.get('/failregister', failRegister);




router.post('/login', passport.authenticate('login',{session: false, failureRedirect:'/faillogin'}), loginJWT);

router.get('/faillogin', failLogin);



router.get('/current2', async (req, res) => {
    res.send(req.user); 
});

router.get('/current', passportCall('jwt'), applyPolicy(['USER' , 'PREMIUM']), (req,res) => {
    console.log(req.user)
    const user = new userDTO(req.user)
    res.send({status:"success", payload: user});
})



router.get('/github' , passport.authenticate('github',{scope:['user:email']}), async(req,res) =>{
})

router.get('/githubcallback', passport.authenticate('github',{session:false, failureRedirect:'/login'}), gitHubCallBack)

router.get('/logout',passportCall('jwt'), logOutJwt);

router.post('/resetpassword', resetPassword);

router.put('/newpassword', newPassword);






export default router;
