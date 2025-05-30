# Microservicio MIGA: Normativas de Alimentación Saludable, filtrado de archivos para la creacion de reportes en PDF

## Descripción

Este microservicio, desarrollado para el módulo MIGA, proporciona una interfaz **GraphQL** para consultar y filtrar documentos normativos relacionados con la alimentación saludable en entornos escolares, así como generar informes en formato PDF. El microservicio consume un endpoint REST del proyecto integrador (`http://localhost:4000/api/documentos`) y expone funcionalidades para reportes con filtrado, cumpliendo con los requerimientos del municipio de La Paz para apoyar proyectos educativos.

### Objetivo

Construir un microservicio para que usuarios MIGA puedan consultar y filtrar documentos normativos del proyecto integrador para poder generar informes en formato PDF basados en criterios de búsqueda específicos.

### Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para el servidor.
- **Express**: Framework para gestionar rutas y middleware.
- **Apollo Server**: Implementación de la API GraphQL.
- **Axios**: Consumo del endpoint REST externo.
- **PDFKit**: Generación de informes PDF.
- **Moment.js**: Formateo de fechas en los informes.

## Instalación del BackEnd Principal
Sigue estos pasos para configurar y ejecutar el back principal localmente:

1. **Clona el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd <nombre-del-repositorio>
   cd Proyecto_MIGA-ignaramita
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**:
  - Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:
    ```env
    PORT=4000
    DB_HOST=localhost
    DB_PORT=3306
    DB_NAME=miga_db
    DB_USER=root
    DB_PASSWORD=tu_contraseña_aquí

    SECRET_JWT_SEED=Esto-Es-UnA-PalbR@_SecretA180605
    ```
  - **PORT**: Puerto donde se ejecutará el microservicio (por defecto 4000).
  - **DB_HOST**: Dirección del host de la base de datos (por defecto `localhost`).
  - **DB_PORT**: Puerto del servidor de base de datos (por defecto `3306`).
  - **DB_NAME**: Nombre de la base de datos utilizada por el microservicio.
  - **DB_USER**: Usuario con permisos para acceder a la base de datos.
  - **DB_PASSWORD**: Contraseña del usuario de la base de datos.
  - **SECRET_JWT_SEED**: Clave secreta utilizada para firmar tokens JWT.

  > **Nota**: Asegúrate de reemplazar `tu_contraseña_aquí` con una contraseña segura y mantener este archivo fuera del control de versiones para proteger información sensible.

4. **Inicia el servidor**:
   ```bash
   npm start
   ```
   - El servidor estará disponible en `http://localhost:4000`.
   - La API a utilizar estará accesible en `http://localhost:4000/api/documentos`.

## Instalación del Microservicio

Sigue estos pasos para configurar y ejecutar el microservicio localmente:

1. **Clona el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd <nombre-del-repositorio>
   cd Microservicio
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**:
   - Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:
     ```env
     PORT=4001
     REST_API_URL=http://localhost:4000/api/documentos
     ```
   - `PORT`: Puerto donde se ejecutará el microservicio (por defecto 4001).
   - `REST_API_URL`: URL del endpoint REST del proyecto integrador.

4. **Inicia el servidor**:
   ```bash
   npm start
   ```
   - El servidor estará disponible en `http://localhost:4001`.
   - La API GraphQL estará accesible en `http://localhost:4001/graphql`.


## Uso

El microservicio expone dos endpoints principales:

### 1. Endpoint GraphQL: `http://localhost:4001/graphql`

Proporciona consultas y mutaciones para interactuar con los documentos normativos.

#### Consulta: `documentos`

Recupera una lista de documentos filtrados según criterios especificados.

**Ejemplo de consulta**:
```graphql
query {
  documentos(filter: { tipo: "Ley", anio: 2023, orderBy: "nombre", orderDirection: "ASC" }) {
    id_documento
    nombre
    tipo
    fuente_origen
    anio_publicacion
    aplicacion
  }
}
```

**Parámetros del filtro** (`DocumentFilter`):
- `tipo`: Tipo de documento (por ejemplo, "ley", "decreto").
- `anio`: Año de publicación (por ejemplo, 2023).
- `orderBy`: Campo para ordenar (por ejemplo, "nombre", "anio_publicacion").
- `orderDirection`: Dirección de ordenamiento ("ASC" o "DESC").

**Respuesta esperada**:
```json
{
  "data": {
    "documentos": [
      {
        "id_documento": 1,
        "nombre": "Ley de Alimentación Saludable",
        "tipo": "Ley",
        "fuente_origen": "Constitución Política del Estado",
        "anio_publicacion": "2023",
        "aplicacion": "Nacional"
      },
      ...
    ]
  }
}
```
#### Mutación: `generarReportePDF`
Genera un informe PDF con los documentos filtrados y campos seleccionados.

**Ejemplo de mutación**:
```graphql
mutation {
  generarReportePDF(
    filter: { tipo: "Ley" }
    fields: ["nombre", "tipo", "anio_publicacion"]
  ) {
    fileName
    downloadUrl
  }
}
```

**Parámetros**:
- `filter`: Criterios de filtrado (igual que en `documentos`).
- `fields`: Lista de campos a incluir en el informe (por ejemplo, ["nombre", "tipo"]).

**Respuesta esperada**:
```json
{
  "data": {
    "generarReportePDF": {
      "fileName": "reporte_documentos_16987654321.pdf",
      "downloadUrl": "/download/reporte_documentos_16987654321.pdf"
    }
  }
}
```

### 2. Endpoint de Descarga: `GET /download/:fileName`

Permite descargar los informes PDF generados.

**Uso**:
- Accede a la URL proporcionada en `downloadUrl` (por ejemplo, `http://localhost:4001/download/reporte_documentos_16987654321.pdf`).
- El archivo se descargará automáticamente como un PDF.

**Notas**:
- Los archivos PDF están disponibles durante 1 hora después de su generación.
- Asegúrate de usar el nombre de archivo exacto retornado por `generarReportePDF`.

## Pruebas
- Se realizaron pruebas tanto en Postman como en GraphQL Playground

### Herramientas de Prueba

- **GraphQL Playground**: Accede a `http://localhost:4001/graphql` en un navegador para probar consultas y mutaciones interactivamente (si `playground: true` está habilitado en Apollo Server).
- **Postman**: Configura solicitudes POST a `http://localhost:4001/graphql` con el cuerpo en formato GraphQL.
- **Navegador**: Usa la URL de descarga para verificar los PDFs generados.

## Estructura de Archivos

La estructura del proyecto refleja una organización modular y clara:

```
/Microservicio
├── node_modules/                # Dependencias instaladas por npm (excluido en .gitignore)
├── src/                         # Código fuente del microservicio
│   ├── assets/                  # Recursos estáticos como imágenes
│   │   └── miga-24.png          # Logo utilizado en los informes PDF
│   ├── config/                  # Configuración del proyecto
│   │   └── index.js             # Configuración de variables de entorno
│   ├── controllers/             # Controladores para manejar la lógica de las rutas
│   │   └── downloadController.js # Lógica para servir archivos PDF desde el endpoint /download
│   ├── graphql/                 # Definición y lógica de la API GraphQL
│   │   ├── resolvers.js         # Implementación de consultas y mutaciones
│   │   └── schema.js            # Esquema GraphQL con tipos y operaciones
│   ├── services/                # Servicios para encapsular lógica de negocio
│   │   └── documentService.js   # Consumo de la API REST y filtrado de documentos
│   ├── utils/                   # Utilidades y funciones auxiliares
│   │   └── pdfGenerator.js      # Generación de informes PDF con PDFKit
│   └── index.js                 # Punto de entrada del servidor Express y Apollo Server
├── Uploads/                     # Directorio temporal para almacenar PDFs generados
│   └── reporte_documentos_174.pdf # Ejemplo de un informe PDF generado
├── .env                         # Archivo de configuración de entorno (excluido en .gitignore)
├── .gitignore                   # Lista de archivos y carpetas a ignorar en el control de versiones
├── package-lock.json            # Registro de versiones exactas de las dependencias
└── package.json                 # Configuración del proyecto, incluyendo dependencias y scripts
```

## Endpoint Externo

El microservicio consume el siguiente endpoint del proyecto integrador:

- **URL**: `http://localhost:4000/api/documentos`
- **Método**: GET
- **Formato de respuesta**: JSON
  ```json
  {
    "ok": true,
    "documentos": [
      {
        "id_documento": 1,
        "nombre": "Ley de Alimentación Saludable",
        "tipo": "ley",
        "fuente_origen": "Constitución Política del Estado",
        "descripcion": "Regula la alimentación en escuelas",
        "importancia": "Artículos 5 y 7 aplicables",
        "anio_publicacion": "2023",
        "enlace": "http://example.com/ley.pdf",
        "aplicacion": "Nacional",
        "cpe": "Definición de la CPE",
        "jerarquia": "Suprema",
        "concepto_basico": "Concepto de alimentación saludable",
        "vistas": 100,
        "palabras_clave_procesadas": "alimentación, escuela",
        "isDeleted": false
      },
      ...
    ]
  }
  ```
- **Justificación**: Este endpoint proporciona los datos normativos requeridos por el módulo MIGA, permitiendo búsquedas y generación de informes.

## Instrucciones Generales

1. Clona el repositorio y sigue las instrucciones de instalación.
2. Prueba la API GraphQL en `http://localhost:4001/graphql` con las consultas/mutaciones de ejemplo.
3. Verifica la generación y descarga de PDFs usando el endpoint `/download`.
4. Revisa las evidencias en la carpeta `evidencias/` y el video de demostración en el pdf.
5. Consulta el código fuente y los comentarios para detalles técnicos.

### Autor

Ignacio Retamozo Torrez