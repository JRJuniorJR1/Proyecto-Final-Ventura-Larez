import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from 'bcrypt';
import passport from "passport";
import nodemailer from 'nodemailer'
import config from "./src/config/config.js";

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);

export default __dirname;

export const cookieExtractor = req => {
    let token;
    if (req && req.cookies) { 
        token = req.cookies['severus24']
    }
    return token;
}

export const passportCall = (strategy) => {
    return async(req, res, next) => {
        passport.authenticate(strategy, function(err, user, info) {
            if (err) return next(err);
            if (!user) {
                return res.status(401).send({error: info.messages ? info.messages: info.toString()})
            }
            req.user = user;
            next();
        }) (req, res, next);
    }
}

export const passportCallForHome = (strategy) => {
    return async(req, res, next) => {
        passport.authenticate(strategy, function(err, user, info) {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        }) (req, res, next);
    }
}

//En desuso. Se esta utilizando applyPolicy desde authMiddleware.js
export const authorization = (role) => {
    return async(req, res, next)=> {
        if (!req.user) {
            return res.status(401).send({error: 'Unauthorized'});
        }
        if (req.user.role != role) {
            return res.status(403).send({error: 'No permissions'});
        }
        next();
    }
}



import { Faker, es } from '@faker-js/faker';

const faker = new Faker({ locale: [es] }) 

export const generateProduct = () => {
    return {
        title: faker.commerce.productName(),
        description: faker.commerce.productAdjective(),
        price: faker.commerce.price(),
        thumbnail: faker.image.imageUrl(),
        code: faker.string.alphanumeric(10),
        stock: +faker.string.numeric(1),
        category: faker.commerce.department(),
        _id: faker.database.mongodbObjectId(),
        image: faker.image.image(),
    }
}


//-----RESTAR PASSWORD----//

export const generateRandomCode = () => {
    const codeLength = 6;
    return crypto.randomBytes(Math.ceil(codeLength / 2))
        .toString('hex')
        .slice(0, codeLength);
}

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD
    }
});

export const sendEmailToUser = async (email, subject, html) => {
    const result = await transport.sendMail({
        from: 'Inicio de sesion en Tienda 5PHNX <' + config.EMAIL_USER + '>',
        to: email,
        subject: subject,
        html: html
    })
    return (result);
}

 export const validateResetCode = () => {
     return async (req, res, next) => {
         const { code, email, password } = req.body;
         if (!email || !password || !code) {
             return res.status(400).send({ status: "error", error: "Datos incompletos" });
         }
         const resetCode = await resetCodesService.getCode(email, code)
         if (!resetCode) {
             return res.status(404).json({ error: 'Código inválido' });
         }
         if (resetCode.expiresAt <= new Date()) {
             return res.status(400).json({ error: 'Código expirado' });
         }
         await resetCodesService.deleteCode(email, code)
         next();
     }
 }