const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { dbConnection, sequelize } = require('./database/config');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');


console.log(process.env);

// Crear el servidor de express
const app = express();

// Base de datos
dbConnection();

//Cors
app.use(cors());

// Directorio público
app.use(express.static('public'));

// Lectura y parseo del body
app.use( express.json() );

// Rutas de la app
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/documentos', require('./routes/documentos'));
app.use('/api/versiones', require('./routes/versionDocumentos'));

// Cargar Swagger YAML
const swaggerDocument = yaml.load(fs.readFileSync('./docs/swagger.yaml', 'utf8'));

// Swagger UI
app.use('/api/documentacion', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const startServer = async () => {
    try {
      // Conexión a la base de datos
      await dbConnection();               
      await sequelize.sync({ alter: true }); 
      console.log('Base de datos sincronizada');
  
      const PORT = process.env.PORT || 4000;
      app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
      });
    } catch (err) {
      console.error('No se pudo iniciar el servidor:', err);
    }
  };
  
  startServer();
