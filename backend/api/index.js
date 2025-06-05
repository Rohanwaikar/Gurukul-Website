import fs from 'node:fs/promises';  // Using 'fs/promises' for promise-based file operations

    
import express from 'express';  // Importing express to create the server

const app = express();  // Creating an instance of express

app.use(express.json());  // Middleware to parse JSON request bodies
app.use(express.static('public'));  // Serving static files from the 'public' directory

app.use((req, res, next) => {   // Middleware to handle CORS (Cross-Origin Resource Sharing)
  // This middleware sets the necessary headers to allow cross-origin requests.
  res.setHeader('Access-Control-Allow-Origin', '*');  // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');  // Allow specific HTTP methods
  // This allows GET and POST requests from any origin.
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers in the request
  if(req.method === 'OPTIONS') {  // If the request method is OPTIONS, respond with a 204 No Content status
    return res.sendStatus(204);  // Respond with a 204 No Content status for preflight requests
  }  // This is used for CORS preflight requests to check allowed methods and headers.
  next();  // Call the next middleware or route handler
});

app.get('/meals', async (req, res) => {  // Route to get available meals
  // This route reads the 'available-meals.json' file and returns its content as JSON.
  const meals = await fs.readFile('./data/available-meals.json', 'utf8'); // Read the file asynchronously
  // The 'utf8' encoding is specified to read the file as a string.
  res.json(JSON.parse(meals)); // Parse the JSON content and send it as a response
}); // End of the meals route

app.post('/orders', async (req, res) => {
  try {
    console.log('Received body:', req.body);

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

app.use((req, res) => { // Middleware to handle requests that do not match any defined routes.
  if (req.method === 'OPTIONS') {  // Handle preflight requests for CORS
    // This middleware handles preflight requests for CORS.
    return res.sendStatus(200);  // Respond with a 200 OK status for OPTIONS requests
  }

  res.status(404).json({ message:  'Not found' });  // If no matching route is found, respond with a 404 Not Found status and a message.
});  // End of the 404 route

app.listen(3001  
, () => console.log('Server is running on port 3001')
);  // Start the server and listen on port 3001
// The server listens on port 3001 and logs a message when it starts successfully.
