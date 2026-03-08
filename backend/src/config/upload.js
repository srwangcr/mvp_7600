const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Tipos de archivos permitidos
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,image/webp').split(',');

// Tamaño máximo de archivo (en bytes)
const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE) || 10) * 1024 * 1024; // MB a bytes

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determinar carpeta según el tipo de upload
    const uploadType = req.baseUrl.includes('casos') ? 'casos' :
                      req.baseUrl.includes('reportes') ? 'reportes' :
                      req.baseUrl.includes('donaciones') ? 'comprobantes' :
                      'otros';
    
    const uploadPath = path.join(__dirname, '../../uploads', uploadType);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: uuid-timestamp-originalname
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido. Solo se permiten: ${ALLOWED_FILE_TYPES.join(', ')}`), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Máximo 5 archivos por request
  },
  fileFilter: fileFilter
});

// Middleware para manejo de errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. Máximo 5 archivos por solicitud.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleMulterError,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE
};
