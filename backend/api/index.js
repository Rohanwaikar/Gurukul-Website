import fs from 'node:fs/promises';
import express from 'express';
import serverless from 'serverless-http';

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.get('/meals', async (req, res) => {
  const meals = await fs.readFile('./data/available-meals.json', 'utf8');
  res.json(JSON.parse(meals));
});

app.post('/orders', async (req, res) => {
  try {
    const customer = req.body.customer;
    if (!customer) {
      return res.status(400).json({ message: 'Missing customer object in request body.' });
    }
    const { name, email, street, mobile, city, 'postal-code': postalCode } = customer;

    if (
      !email || !email.includes('@') ||
      !name || name.trim() === '' ||
      !street || street.trim() === '' ||
      !postalCode || postalCode.trim() === '' ||
      !city || city.trim() === '' ||
      !mobile || mobile.trim() === ''
    ) {
      return res.status(400).json({
        message: 'Missing data: Email, name, street, postal code, city or mobile number is missing.',
      });
    }

    const newOrder = {
      customer: { name, email, street, mobile, city, postalCode },
      id: Date.now().toString(),
    };

    const orders = await fs.readFile('./data/orders.json', 'utf8');
    const allOrders = JSON.parse(orders);
    allOrders.push(newOrder);
    await fs.writeFile('./data/orders.json', JSON.stringify(allOrders, null, 2));

    res.status(201).json({ message: 'Order created!' });
  } catch (error) {
    console.error('Error while creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.use((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  res.status(404).json({ message: 'Not found' });
});

export const handler = serverless(app);