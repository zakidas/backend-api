const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

app.use(cors())

const PORT = process.env.PORT || 3050;

app.use(bodyParser.json());

// MySql
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodebackend_mysql'
});
/*
const connection = mysql.createConnection({
    host: '34.122.225.150',
    user: 'root',
    password: 'jesus2020',
    database: 'nodebackend_mysql'
});
*/
// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    swaggerDefinition: {
      info: {
        version: "1.0.0",
        title: "Promar API",
        description: "Promart API Information",
        contact: {
          name: "Jesus Solano Developer"
        },
        servers: ["http://localhost:3050"]
      }
    },
    basePath: "/",
    // ['.routes/*.js']
    apis: ["app.js"]
  };
  
  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  
    // Route
    app.get('/', (req, res) => {
        res.send('Welcome to my API!');
    });
    /**
     * @swagger
     * /listclientes:
     *  get:
     *    tags:
     *      - Cliente
     *    description: Lista de personas con todos los datos + fecha probable de muerte de cada una
     *    responses:
     *      '200':
     *        description: A successful response
     */
    app.get('/listclientes', (req, res) => {
        const sql = 'select idclient, client_nom, client_ape, client_age, DATE_FORMAT(client_fec_nac,"%Y-%m-%d") as client_fec_nac, DATE_FORMAT(client_fec_muerte,"%Y-%m-%d") as client_fec_muerte from clients';  
        connection.query(sql, (error, results) => {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).send('No hay resultados');
        }
        });
    });
    // Routes
    /**
     * @swagger
     * /cliente/{id}:
     *  get:
     *    tags:
     *      - Cliente
     *    description: Listar cliente por id
     *    parameters:
     *      - name: id
     *        type: number
     *        in: path
     *        required: true
     *    responses:
     *      '200':
     *        description: A successful response
     */
    app.get('/cliente/:id', (req, res) => {
        const { id } = req.params;
        const sql = `select idclient, client_nom, client_ape, client_age, DATE_FORMAT(client_fec_nac,"%Y-%m-%d") as client_fec_nac, DATE_FORMAT(client_fec_muerte,"%Y-%m-%d") as client_fec_muerte from clients WHERE idclient = ${id}`;  
        connection.query(sql, (error, result) => {
        if (error) throw error;
    
        if (result.length > 0) {
            res.json(result);
        } else {
            res.send('No hay resultados');
        }
        });
    });
    // Routes
    /**
     * @swagger
     * /cliente/{id}:
     *  delete:
     *    tags:
     *      - Cliente
     *    description: Eliminar cliente por id
     *    parameters:
     *      - name: id
     *        type: number
     *        in: path
     *        required: true
     *    responses:
     *      '200':
     *        description: A successful response
     */
     app.delete('/cliente/:id', (req, res) => {
        const { id } = req.params;
        const sql = `delete from clients WHERE idclient = ${id}`;  
        connection.query(sql, (error, result) => {
        if (error) throw error;
        res.header ("Access-Control-Allow-Origin", "*");
        res.status(200).send('cliente eliminado!');
        });
    });
    // Routes
    /**
     * @swagger
     * /kpideclientes:
     *  get:
     *    tags:
     *      - Cliente
     *    description: Promedio edad entre todos los clientes???
     *                 Desviaci??n est??ndar entre las edades de todos los clientes???
     *    responses:
     *      '200':
     *        description: A successful response
     */
    app.get('/kpideclientes', (req, res) => {
        const sql = `CALL kpiclientes()`;
        connection.query(sql, (error, result) => {
        if (error) throw error;
    
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.send('No hay resultados');
        }
        });
    });
  
    /**
     * @swagger
     * /creacliente:
     *  post:
     *    tags:
     *      - Cliente
     *    description: Creaci??n del cliente
     *    parameters:
     *      - name: cliente
     *        in: body
     *        description: Objecto cliente
     *        required: true
     *        schema:
     *           type: object
     *           $ref: '#/definitions/Cliente'
     *    responses:
     *      '201':
     *        description: Success
     */

    /**
     * @swagger
     * definitions:
     *   Cliente:
     *     required:
     *       - nombre
     *       - apellido
     *       - fec_nac
     *     properties:
     *       nombre:
     *         type: string
     *       apellido:
     *         type: string
     *       edad:
     *         type: integer
     *       fec_nac:
     *         type: string
     */
    app.post('/creacliente', (req, res) => {
        const sql = 'CALL crear_cliente(?,?,?,?)';
    
        const clientObj = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        edad: req.body.edad,
        fec_nac: req.body.fec_nac
        };
        
        connection.query(sql, [clientObj.nombre, clientObj.apellido, clientObj.edad, clientObj.fec_nac], error => {
        if (error) throw error;
        res.header ("Access-Control-Allow-Origin", "*");
        res.status(201).send('client created!');
        });
    });
  
    // Check connect
    connection.connect(error => {
        if (error) throw error;
        console.log('Database server running!');
    });
  
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));