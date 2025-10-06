const express = require('express');
const mariadb = require('mariadb');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer API',
      version: '1.0.0',
      description: 'REST API for managing customers (with MariaDB)',
    },
    servers: [
      {
        url: `http://129.212.183.79:3000`,
      },
    ],
  },
  apis: ['./server.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root', 
  database: 'sample',
  port: 3306,
  connectionLimit: 5,
});

/**
 * @swagger
 * /agents:
 *   get:
 *     summary: Get all agents
 *     description: Returns a list of all agents with their code, name, working area, and commission.
 *     responses:
 *       200:
 *         description: A list of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   AGENT_CODE:
 *                     type: string
 *                     example: "A001"
 *                   AGENT_NAME:
 *                     type: string
 *                     example: "John Doe"
 *                   WORKING_AREA:
 *                     type: string
 *                     example: "New York"
 *                   COMMISSION:
 *                     type: number
 *                     example: 0.15
 */
app.get('/agents', async (req, res) => {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION FROM agents'
    );
    conn.release();
    res.json(rows);
});

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies
 *     description: Returns a list of all companies with their ID, name, and city.
 *     responses:
 *       200:
 *         description: A list of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   COMPANY_ID:
 *                     type: integer
 *                     example: 101
 *                   COMPANY_NAME:
 *                     type: string
 *                     example: "Tech Corp"
 *                   COMPANY_CITY:
 *                     type: string
 *                     example: "San Francisco"
 */
app.get('/companies', async (req, res) => {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT COMPANY_ID, COMPANY_NAME, COMPANY_CITY FROM company'
    );
    conn.release();
    res.json(rows);
});

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers
 *     description: Returns a list of all customers with basic details.
 *     responses:
 *       200:
 *         description: A list of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   CUST_CODE:
 *                     type: string
 *                     example: "C10001"
 *                   CUST_NAME:
 *                     type: string
 *                     example: "Alice Corp"
 *                   CUST_CITY:
 *                     type: string
 *                     example: "Charlotte"
 *                   WORKING_AREA:
 *                     type: string
 *                     example: "East"
 *                   CUST_COUNTRY:
 *                     type: string
 *                     example: "USA"
 */
app.get('/customers', async (req, res) => {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY FROM customer'
    );
    conn.release();
    res.json(rows);

});

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     description: Adds a new customer to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CUST_CODE:
 *                 type: string
 *                 example: "C10001"
 *               CUST_NAME:
 *                 type: string
 *                 example: "Alice Corp"
 *               CUST_CITY:
 *                 type: string
 *                 example: "Charlotte"
 *               WORKING_AREA:
 *                 type: string
 *                 example: "East"
 *               CUST_COUNTRY:
 *                 type: string
 *                 example: "USA"
 *               GRADE:
 *                 type: integer
 *                 example: 2
 *               OPENING_AMT:
 *                 type: number
 *                 example: 500.00
 *               RECEIVE_AMT:
 *                 type: number
 *                 example: 200.00
 *               PAYMENT_AMT:
 *                 type: number
 *                 example: 100.00
 *               OUTSTANDING_AMT:
 *                 type: number
 *                 example: 600.00
 *               PHONE_NO:
 *                 type: string
 *                 example: "123-4567890"
 *               AGENT_CODE:
 *                 type: string
 *                 example: "A001"
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Missing required fields
 */

app.post('/customers', async (req, res) => {
    const { CUST_CODE,
      CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE } = req.body;
    if (!CUST_CODE || !CUST_NAME) {
      return res.status(400).json({ error: 'CUST_CODE and CUST_NAME are required' });
    }
    const custCode = CUST_CODE.trim();
    const custName = CUST_NAME.trim();

    const conn = await pool.getConnection();
    await conn.query(
      `INSERT INTO customer 
       (CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY,
        GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT,
        PHONE_NO, AGENT_CODE)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        custCode, custName, CUST_CITY || null, WORKING_AREA || null, CUST_COUNTRY || null, GRADE || null, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO || null, AGENT_CODE
      ]
    );
    conn.release();

    res.status(201).json({ message: 'Customer created', CUST_CODE: custCode });
});

/**
 * @swagger
 * /customers/{code}:
 *   delete:
 *     summary: Delete a customer
 *     description: Removes a customer from the database by CUST_CODE.
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: Customer code to delete
 *         schema:
 *           type: string
 *           example: C10001
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 */
app.delete('/customers/:code', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      'DELETE FROM customer WHERE CUST_CODE = ?',
      [req.params.code]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted', CUST_CODE: req.params.code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /customers/{code}:
 *   put:
 *     summary: Update an existing customer
 *     description: Update the details of a customer by their CUST_CODE.
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: The customer code (CUST_CODE)
 *         schema:
 *           type: string
 *           example: C10001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CUST_NAME:
 *                 type: string
 *                 example: "Updated Corp"
 *               CUST_CITY:
 *                 type: string
 *                 example: "New York"
 *               WORKING_AREA:
 *                 type: string
 *                 example: "West"
 *               CUST_COUNTRY:
 *                 type: string
 *                 example: "USA"
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       400:
 *         description: Bad request (missing data)
 *       404:
 *         description: Customer not found
 */
app.put('/customers/:code', async (req, res) => {
  const { code } = req.params;
  const { CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY } = req.body;

  if (!CUST_NAME) {
    return res.status(400).json({ error: 'CUST_NAME is required' });
  }

  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      `UPDATE customer
       SET CUST_NAME = ?, CUST_CITY = ?, WORKING_AREA = ?, CUST_COUNTRY = ?
       WHERE CUST_CODE = ?`,
      [CUST_NAME, CUST_CITY || null, WORKING_AREA || null, CUST_COUNTRY || null, code]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully', CUST_CODE: code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/say', (req, res) => {
  const keyword = req.query.keyword;
  
  res.json({ message: `Jake-Pinos says ${keyword}` });
});


app.listen(port, () => {
  console.log(`API listening at http://129.212.183.79:${port}/`);
});