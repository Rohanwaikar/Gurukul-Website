import fs from 'node:fs/promises';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const customer = req.body.customer;
      if (!customer) {
        return res.status(400).json({ message: 'Missing customer object in request body.' });
      }

      const { name, email, street, mobile, city, 'postal-code': postalCode } = customer;

      if (
        !email || !email.includes('@') ||
        !name || !name.trim() ||
        !street || !street.trim() ||
        !postalCode || !postalCode.trim() ||
        !city || !city.trim() ||
        !mobile || !mobile.trim()
      ) {
        return res.status(400).json({
          message: 'Missing required fields',
        });
      }

      const newOrder = {
        customer: { name, email, street, mobile, city, postalCode },
        id: Date.now().toString(),
      };

      const orders = await fs.readFile('data/orders.json', 'utf8');
      const allOrders = JSON.parse(orders);
      allOrders.push(newOrder);
      await fs.writeFile('data/orders.json', JSON.stringify(allOrders, null, 2));

      res.status(201).json({ message: 'Order created!' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
