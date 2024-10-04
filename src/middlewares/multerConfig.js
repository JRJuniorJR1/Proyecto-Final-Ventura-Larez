import multer from 'multer';
import __dirname from '../../utils.js';
import path from 'path';
import fs from 'fs';

// Configuración de dónde se guardarán los archivos:
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folderPath = __dirname + '/src/public/documents'; // Carpeta predeterminada
    if (file.fieldname === 'profile') folderPath = __dirname + '/src/public/profiles';
    if (file.fieldname === 'product') folderPath = __dirname + '/src/public/products';

    // Verifica si la carpeta existe, si no, la crea
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '')}`); // Elimina los espacios en blanco
  }
});

const upload = multer({ storage });
export default upload;




// const storage = multer.diskStorage({
//   //destination hace referencia a la carpeta donde se guardara el archivo.
//   destination: function (req, file, cb) {
//     console.log('====>File:',file)
//     //const ext = path.extname(file.originalname).toLowerCase(); // Extrae la extensión del archivo original
//     let path = __dirname + '/src/public/documents'; // Especificamos la ruta; Por defecto, guarda en 'documents'
//     if (file.originalname.split('.')[0] === 'profile') path = __dirname + '/src/public/profiles';
//     if (file.originalname.split('.')[0] === 'product') path = __dirname + '/src/public/products';
//     if (file.originalname.split('.')[0] === 'identification' || file.originalname.split('.')[0] === 'address_proof' || file.originalname.split('.')[0] === 'account_statement') pathDir = __dirname + '/src/public/documents';
//     cb(null, path);
//   },
//   //filename hace referencia al nombre final que tendra el archivo
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()} - ${file.originalname}`);
//   }
// });

//antiguo
/* import multer from 'multer';
import __dirname from '../../utils.js';
import path from 'path';


//configuracion de donde se guardaran los archivos:
const storage = multer.diskStorage({
  //destination hace referencia a la carpeta donde se guardara el archivo.
  destination: function (req, file, cb) {
    let path = __dirname + '/src/public/documents'; // Especificamos la ruta; Por defecto, guarda en 'documents'
    if (file.fieldname === 'profile') path = __dirname + '/src/public/profiles';
    if (file.fieldname === 'product') path = __dirname + '/src/public/products';
    cb(null, path);
  },
  //filename hace referencia al nombre final que tendra el archivo
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '')}`); //elimina los espacios en blanco
  }
});

const upload = multer({storage});
export default upload; */