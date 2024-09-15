import  jwt  from "jsonwebtoken";
import nodemailer from 'nodemailer';
import config from "../config/config.js";
import { userService } from "../services/index.js";
import { resetPasswordCodeService } from "../services/index.js";
import crypto from 'crypto';
import { createHash } from "../../utils.js";

export const register = async (req, res, next) => {
    req.logger.info('Session controller - Registro de usuario iniciado');

    try {
        const { email } = req.user;

        const transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASSWORD
            }
        });

        try {
            let result = await transport.sendMail({
                from:'Tienda 5PHNX - confirmacion de registro <' + config.EMAIL_USER + '>',
                to: email,
                subject: "Confirmación de registro",
                html:`
                <div>
                    <p>¡Bienvenido a Tienda 5PHNX! Su registro ha sido exitoso.</p>
                    <p>Si no fuiste tú quién se registró, ignora este mensaje.</p>
                </div>
                `,
                attachments:[]
            })
            req.logger.info(`Correo de confirmación de registro enviado al usuario ${email}`);
        } catch (error) { 
            console.log('Error:', error.message);
            req.logger.error(`Error enviando correo electrónico: ${error.message}`);
            return res.status(500).json({ message: 'Error enviando correo electrónico' });
        }

        res.status(200).json({status: 'success', message: 'Registro exitoso'});
        req.logger.info('Session controller - Registro de usuario completado exitosamente');
    } catch (error) {
        req.logger.error(error.message)
        next(error)
    }
}

export const failRegister = async(req,res)=>{
    req.logger.error("Session controller - Failed Strategy");
    res.status(400).json({error:"Failed"});
}

export const loginSession = async (req, res) => {
    if(!req.user){
        req.logger.error('Session controller - Credenciales inválidas');
        return res.status(400).json({status:'error' , error: 'Credenciales invalidas' })
    }

    req.user.last_connection = Date.now();
    await userService.updateUserById(req.user._id, req.user);
    delete req.user.password; 

    req.session.user = req.user
    req.logger.info(`Session controller - Usuario ${req.user._id} ha iniciado sesión`);
    res.json({status:'success', payload: req.session.user});
}

export const loginJWT = async (req, res) => {
    req.logger.info('Session controller - Inicio de sesión con JWT iniciado');
    const serializedUser = {
        _id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        role: req.user.role,
        email: req.user.email
    }

    req.user.last_connection = Date.now();
    await userService.updateUserByEmail(req.user.email, req.user);
    const token = jwt.sign(serializedUser, process.env.JWT_SECRET , {expiresIn: '1h'})
    res.cookie('severus24', token, {maxAge: 3600000, httpOnly: true, secure: true}).send({status:"success", payload: serializedUser});
    req.logger.info(`Session controller - Token JWT generado para el usuario ${req.user._id}`);

     const transport = nodemailer.createTransport({
         service: 'gmail',
         port: 587,
         auth: {
             user: process.env.EMAIL_USER,
             pass: process.env.EMAIL_PASSWORD
         }
     });
     let result;
     try {
         result = await transport.sendMail({
             from:'Inicio de sesion en Tienda 5PHNX <' + process.env.EMAIL_USER + '>',
             to: req.user.email,
             subject: 'Inicio de sesion en Tienda 5PHNX',
             html:`
             <div>
                 <h1>Has iniciado sesion en Tienda 5PHNX!</h1>
             </div>
             `,
             attachments:[]
         })
         req.logger.info(`Correo de inicio de sesión enviado al usuario ${req.user.email}`);
     } catch (error) {
         req.logger.error('Error enviando correo electrónico:', error);
     }
}

export const gitHubCallBack = async (req, res) => {
    req.logger.info('Session controller - Inicio de sesión con JWT en Git Hub iniciado');
    const serializedUser = {
        _id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        cart: req.user.cart,
        role: req.user.role
    }

    req.user.last_connection = Date.now();
    await userService.updateUserByEmail(req.user.email, req.user);

    const token = jwt.sign(serializedUser, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.cookie('severus24', token, { maxAge: 3600000, httpOnly: true });
    req.logger.info(`Session controller - Token JWT generado con Git Hub para el usuario ${req.user._id}`);
    res.redirect('/products')
}

export const failLogin = async(req,res) => {
    req.logger.error("Session controller - Failed Strategy");
    res.status(400).json({error:"Failed"});
}

export const logOutJwt = async (req, res) => {
    try {
        const userDataToUpdate = {
            last_connection: Date.now()
        };
        await userService.updateUserByEmail(req.user.email, userDataToUpdate);

        res.clearCookie('severus24');
        req.logger.info('Session controller - JWT logout exitoso');
        res.redirect('/');
    } catch (error) {
        req.logger.error('Session controller - Error al cerrar la sesión JWT:', error);
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
}

export const logOutSession = (req, res) => {
	req.session.destroy((error) => {
		if (error) {
			req.logger.error('Session controller - Error al cerrar la sesión:', error);
			res.status(500).send('Error al cerrar la sesión');
		} else {
			res.clearCookie('connect.sid');
            req.logger.info('Session controller - Logout de sesión exitoso');
			res.redirect('/login');
		}
	})
}

export const resetPassword = async (req, res, next) => {
    const { email } = req.body;
    req.logger.info(`Restableciendo contraseña para el usuario: ${email}`);

    try {
        const user = await userService.getUserByEmail(email);
        if (!user) {
            req.logger.info('El correo electrónico no está registrado');
            return res.status(400).json({ message: 'El correo electrónico no está registrado' });
        }
        const generateRandomCode = () => {
            return crypto.randomBytes(4).toString('hex');
        }

        const code = generateRandomCode();
        req.logger.info(`Código generado: ${code}`);
        const newCode = await resetPasswordCodeService.saveCode(email, code);
        req.logger.info(`Código guardado: ${newCode}`);
        
        const transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASSWORD
            }
        });
        
        try {
           let result = await transport.sendMail({
                from:'Tienda 5PHNX - recuperacion de contraseña <' + config.EMAIL_USER + '>',
                to: email,
                subject: "Código de recuperación de tu contraseña",
                html:`
                <div>
                    <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:<br><a href="http://localhost:8080/newpassword/${code}">http://localhost:8080/newpassword/${code}</a></p>
                    <p>El código para recuperar tu contraseña es: ${code}<br>Si no fuiste tú quién lo solicitó, ignora este mensaje.</p>
                </div>
                `,
                attachments:[]
            })
            req.logger.info(`Correo de inicio de sesión enviado al usuario ${email}`);
        } catch (error) { 
            console.log('Error:', error.message);
            req.logger.error(`Error enviando correo electrónico: ${error.message}`);
            return res.status(500).json({ message: 'Error enviando correo electrónico' });
        }

        res.status(200).json({status: 'success', message: 'Código de recuperación enviado exitosamente'});
    } catch (error) {
        req.logger.error(error.message)
        next(error)
    }
}

export const newPassword = async (req, res) => {
    req.logger.info('Reiniciando la contraseña');
    try {
        const { code, password } = req.body;

        const resetCode = await resetPasswordCodeService.getCode(code);
        if (!resetCode) {
            req.logger.warn('Código de recuperación inválido');
            return res.status(400).json({ status: "error", message: "Código de recuperación inválido" });
        }
        
        const passwordHash = createHash(password);
        const updates = { password: passwordHash };
        const updatedUser = await userService.updateUserByEmail(resetCode.email, updates);
        if (!updatedUser) {
            req.logger.error('Error al actualizar la contraseña del usuario');
            return res.status(500).json({ status: "error", message: "Error al actualizar la contraseña del usuario" });
        }
        req.logger.info('Contraseña actualizada con éxito');
        res.json({ status: "success", message: "Contraseña actualizada con éxito" });
    } catch (error) {
        req.logger.error(`Error al reiniciar la contraseña: ${error}`);
        res.status(500).json({ status: "error", message: "Error del servidor" });
    }
}