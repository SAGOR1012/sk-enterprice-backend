// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const jwt = require('jsonwebtoken');

// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// const bcrypt = require('bcrypt'); // <-- Added bcrypt for hashing
// const cookeParser = require('cookie-parser');
// const app = express();
// const port = process.env.PORT || 5000;

// /* middleware */
// app.use(
//   cors({
//     origin: ['http://localhost:5173'],
//     credentials: true,
//   })
// );
// app.use(express.json()); // To parse JSON bodies
// app.use(cookeParser());
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@skenterprise.bvccnzb.mongodb.net/?retryWrites=true&w=majority&appName=skenterprise`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     await client.connect();

//     /* ----------------------------------MongoDB collections Start -------------------------------*/
//     /* products collection */
//     const allProductsCollection = client
//       .db('sk-enterprise-DB')
//       .collection('allProducts');
//     /* Users collection  */
//     const usersCollections = client.db('sk-enterprise-DB').collection('users');
//     /* Orders collection */
//     const ordersCollections = client
//       .db('sk-enterprise-DB')
//       .collection('orders');
//     /* Daily sell collection  */
//     const dailySellCollection = client
//       .db('sk-enterprise-DB')
//       .collection('dailySell');
//     /* Monthly sell collection */
//     const monthlySellCollection = client
//       .db('sk-enterprise-DB')
//       .collection('monthlySell');
//     const monthlyTargetCollection = client
//       .db('sk-enterprise-DB')
//       .collection('monthlyTarget');

//     /* MongoDB collections End */

//     /* Auth Related api */
//     app.post('/jwt', async (req, res) => {
//       const user = req.body;
//       const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
//         expiresIn: '1h',
//       });
//       res.cookie('token', token, { httpOnly: true, secure: false });
//       res.send(token);
//     });
//     /* Test API */
//     app.get('/', (req, res) => {
//       res.send('sk server on');
//     });
//     /* ====================== User API ====================== */
//     /* Find all users route  */
//     app.get('/users', async (req, res) => {
//       try {
//         const allUsers = await usersCollections.find().toArray();
//         res.send(allUsers);
//       } catch (error) {
//         console.log(error);
//         res.status(500).send({ error: 'Failed to fetch users' });
//       }
//     });
//     // single user by email
//     app.get('/user/:email', async (req, res) => {
//       try {
//         const user = await usersCollections.findOne({
//           email: req.params.email,
//         });
//         if (!user) {
//           return res.status(404).send({ message: 'User not found' });
//         }
//         res.send(user); // <-- response পাঠাতে হবে
//       } catch (error) {
//         console.log(error);
//         res.status(500).send({ error: 'Failed to fetch user' });
//       }
//     });

//     /* ====================== User API ====================== */
//     // Create a new user (signup) with password hashing
//     app.post('/users', async (req, res) => {
//       try {
//         const {
//           name,
//           email,
//           password,
//           photoURL,
//           role,
//           verify,
//           phone,
//           firebaseUID,
//         } = req.body;

//         // Check if email already exists
//         const existingUser = await usersCollections.findOne({ email });
//         if (existingUser) {
//           return res.status(400).send({ error: 'User already exists' });
//         }

//         // Hash the password
//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(password, saltRounds);

//         // Create user object
//         const newUser = {
//           name,
//           email,
//           password: hashedPassword, // Store hashed password
//           photoURL: photoURL || '',
//           role: role || 'user',
//           verify: verify || false,
//           phone: phone || '',
//           firebaseUID: firebaseUID || '',
//         };

//         const result = await usersCollections.insertOne(newUser);
//         res.status(201).send({
//           message: 'User created successfully',
//           userId: result.insertedId,
//         });
//       } catch (error) {
//         console.error(error);
//         res.status(500).send({ error: 'Failed to create user' });
//       }
//     });

//     /* ====================== Product related API ====================== */
//     // Get all products
//     app.get('/products', async (req, res) => {
//       try {
//         const products = await allProductsCollection.find().toArray();
//         console.log('tok tok cookeis', req.cookies.token);
//         res.send(products);
//       } catch (error) {
//         res.status(500).send({ error: 'Failed to fetch products' });
//       }
//     });

//     // app.get('/products', async (req, res) => {
//     //   const result = await allProductsCollection.find().toArray();
//     //   res.send(result);
//     // });

//     // Add a new product
//     app.post('/products', async (req, res) => {
//       try {
//         const newProduct = req.body;
//         const result = await allProductsCollection.insertOne(newProduct);
//         res.status(201).send({
//           message: 'Product added successfully',
//           productId: result.insertedId,
//         });
//       } catch (error) {
//         res.status(500).send({ error: 'Failed to add product' });
//       }
//     });

//     // Update a product by ID

//     app.put('/products/:id', async (req, res) => {
//       const { id } = req.params;
//       const updatedProduct = req.body;

//       if (!ObjectId.isValid(id)) {
//         return res.status(400).send({ error: 'Invalid product ID' });
//       }

//       try {
//         const result = await allProductsCollection.updateOne(
//           { _id: new ObjectId(id) },
//           { $set: updatedProduct }
//         );
//         if (result.matchedCount === 0) {
//           return res.status(404).send({ error: 'Product not found' });
//         }
//         res.send({ message: 'Product updated successfully' });
//       } catch (error) {
//         console.error(error);
//         res.status(500).send({ error: 'Failed to update product' });
//       }
//     });

//     //! Delete a product by ID
//     // Delete
//     app.delete('/products/:id', async (req, res) => {
//       const { id } = req.params;
//       if (!ObjectId.isValid(id)) {
//         return res.status(400).send({ error: 'Invalid product ID' });
//       }
//       try {
//         const result = await allProductsCollection.deleteOne({
//           _id: new ObjectId(id),
//         });
//         if (result.deletedCount === 0) {
//           return res.status(404).send({ error: 'Product not found' });
//         }
//         res.send({ message: 'Product deleted successfully' });
//       } catch (error) {
//         console.error(error); // <-- log error
//         res.status(500).send({ error: 'Failed to delete product' });
//       }
//     });

//     /* ====================== Product related API END====================== */

//     /* ====================== Orders related API Start====================== */

//     /* get all orders */
//     app.get('/orders', async (req, res) => {
//       try {
//         const orders = await ordersCollections.find().toArray();
//         res.send(orders);
//       } catch (error) {
//         res.status(500).send({ error: 'Failed to fetch order' });
//       }
//     });
//     /* post individual order */
//     // app.post('/orders', async (req, res) => {
//     //   try {
//     //     const newOrder = req.body;

//     //     // ১. অর্ডার ইনসার্ট
//     //     const orderResult = await ordersCollections.insertOne(newOrder);

//     //     // ২. প্রতিটি প্রোডাক্টের স্টক আপডেট
//     //     for (const item of newOrder.items) {
//     //       if (!item._id) continue; // যদি _id না থাকে skip
//     //       const product = await allProductsCollection.findOne({
//     //         _id: new ObjectId(item._id),
//     //       });

//     //       if (!product) continue; // যদি প্রোডাক্ট না থাকে skip

//     //       // স্টক কমানো, ensure stock doesn't go negative
//     //       const newStock = Math.max(0, (product.stock || 0) - item.quantity);
//     //       await allProductsCollection.updateOne(
//     //         { _id: new ObjectId(item._id) },
//     //         { $set: { stock: newStock } }
//     //       );
//     //     }

//     //     res.status(201).send({
//     //       message: 'Order placed successfully',
//     //       orderId: orderResult.insertedId,
//     //     });
//     //   } catch (error) {
//     //     console.error(error);
//     //     res.status(500).send({ error: 'Failed to place order' });
//     //   }
//     // });
//     app.post('/orders', async (req, res) => {
//       try {
//         const newOrder = req.body;
//         const orderResult = await ordersCollections.insertOne(newOrder);

//         // -------- স্টক আপডেট --------
//         for (const item of newOrder.items) {
//           if (!item._id) continue;
//           const product = await allProductsCollection.findOne({
//             _id: new ObjectId(item._id),
//           });

//           if (!product) continue;

//           const newStock = Math.max(0, (product.stock || 0) - item.quantity);
//           await allProductsCollection.updateOne(
//             { _id: new ObjectId(item._id) },
//             { $set: { stock: newStock } }
//           );
//         }

//         // -------- ডেইলি সেল আপডেট --------
//         const today = new Date();
//         const dateKey = today.toISOString().split('T')[0]; // yyyy-mm-dd
//         const orderTotal = newOrder.total || 0;

//         await dailySellCollection.updateOne(
//           { date: dateKey },
//           {
//             $inc: { totalSell: orderTotal },
//             $push: { orders: orderResult.insertedId },
//           },
//           { upsert: true }
//         );

//         // -------- মাসিক সেল আপডেট --------
//         const monthKey = `${today.getFullYear()}-${today.getMonth() + 1}`; // yyyy-mm
//         await monthlySellCollection.updateOne(
//           { month: monthKey },
//           {
//             $inc: { totalSell: orderTotal },
//             $push: { orders: orderResult.insertedId },
//           },
//           { upsert: true }
//         );

//         res.status(201).send({
//           message: 'Order placed & sales updated successfully',
//           orderId: orderResult.insertedId,
//         });
//       } catch (error) {
//         console.error(error);
//         res.status(500).send({ error: 'Failed to place order' });
//       }
//     });

//     /* get all products function  */
//     app.get('/products', async (req, res) => {
//       try {
//         const products = await allProductsCollection.find().toArray();
//         res.send(products);
//       } catch (error) {
//         res.status(500).send({ error: 'Failed to fetch products' });
//       }
//     });

//     /* ====================== Daily Sell APIs ====================== */
//     app.get('/daily-sell', async (req, res) => {
//       const records = await dailySellCollection.find().toArray();
//       res.send(records);
//     });

//     /* ====================== Monthly Sell APIs ====================== */
//     app.get('/monthly-sell', async (req, res) => {
//       const records = await monthlySellCollection.find().toArray();
//       res.send(records);
//     });

//     /* ====================== Monthly Target API ====================== */

//     // Get target for a specific month
//     app.get('/monthly-target', async (req, res) => {
//       try {
//         const month = req.query.month; // e.g., 2025-09
//         if (!month)
//           return res.status(400).send({ message: 'Month is required' });

//         const targetRecord = await monthlyTargetCollection.findOne({ month });
//         if (!targetRecord)
//           return res
//             .status(404)
//             .send({ message: 'No target found for this month' });

//         res.send(targetRecord);
//       } catch (error) {
//         console.error(error);
//         res.status(500).send({ error: 'Failed to fetch monthly target' });
//       }
//     });

//     // Set or update target for a specific month
//     app.post('/monthly-target', async (req, res) => {
//       try {
//         const { month, value } = req.body;
//         if (!month || value == null)
//           return res
//             .status(400)
//             .send({ message: 'Month and value are required' });

//         // Update if exists, else create
//         const result = await monthlyTargetCollection.findOneAndUpdate(
//           { month },
//           { $set: { value } },
//           { upsert: true, returnDocument: 'after' }
//         );

//         res.send({
//           message: 'Monthly target set/updated',
//           target: result.value,
//         });
//       } catch (error) {
//         console.error(error);
//         res.status(500).send({ error: 'Failed to set/update monthly target' });
//       }
//     });
//     await client.db('admin').command({ ping: 1 });
//     console.log(
//       'Pinged your deployment. You successfully connected to MongoDB!'
//     );
//   } finally {
//     // await client.close();
//   }
// }
// run().catch(console.dir);

// app.listen(port, () => {
//   console.log(`server is running on port : ${port}`);
// });

// index.js
//...............with jwt start.........................

// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const bcrypt = require('bcrypt');
// const cookieParser = require('cookie-parser');

// const app = express();
// const port = process.env.PORT || 5000;

// /* ---------- Middleware ---------- */
// const allowedOrigins = [
//   'http://localhost:5173', // for local host
//   // 'https://skenterprise1.netlify.app',
// ];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(cookieParser());

// /* ---------- JWT Verify Middleware ---------- */

// const verifyToken = (req, res, next) => {
//   const token = req.cookies?.token;
//   if (!token)
//     return res.status(401).send({ message: 'Unauthorized: No token' });

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err)
//       return res.status(403).send({ message: 'Forbidden: Invalid token' });
//     req.user = decoded;
//     next();
//   });
// };

// /* ---------- MongoDB Setup ---------- */
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@skenterprise.bvccnzb.mongodb.net/?retryWrites=true&w=majority&appName=skenterprise`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     await client.connect();
//     const db = client.db('sk-enterprise-DB');

//     const allProductsCollection = db.collection('allProducts');
//     const usersCollections = db.collection('users');
//     const ordersCollections = db.collection('orders');
//     const dailySellCollection = db.collection('dailySell');
//     const monthlySellCollection = db.collection('monthlySell');
//     const monthlyTargetCollection = db.collection('monthlyTarget');

//     /* ---------- Auth API ---------- */
//     //Login route
//     app.post('/jwt', async (req, res) => {
//       const user = req.body; // { email }
//       const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
//         expiresIn: '1h',
//       });

//       res.cookie('token', token, {
//         httpOnly: true,
//         secure: false, // dev environment
//         // secure: true, // production
//         sameSite: 'lax', // production
//       });

//       res.send({ token });
//     });

//     /* ---------- Public Test ---------- */
//     app.get('/', (req, res) => res.send('SK Enterprise server is running ✅'));

//     /* ---------- User APIs ---------- */
//     app.get('/users', verifyToken, async (req, res) => {
//       const users = await usersCollections.find().toArray();
//       res.send(users);
//     });

//     app.get('/user/:email', verifyToken, async (req, res) => {
//       const user = await usersCollections.findOne({ email: req.params.email });
//       if (!user) return res.status(404).send({ message: 'User not found' });
//       res.send(user);
//     });

//     app.post('/users', async (req, res) => {
//       const {
//         name,
//         email,
//         password,
//         photoURL,
//         role,
//         verify,
//         phone,
//         firebaseUID,
//       } = req.body;

//       const existingUser = await usersCollections.findOne({ email });
//       if (existingUser)
//         return res.status(400).send({ error: 'User already exists' });

//       const hashedPassword = await bcrypt.hash(password, 10);

//       const newUser = {
//         name,
//         email,
//         password: hashedPassword,
//         photoURL: photoURL || '',
//         role: role || 'user',
//         verify: verify || false,
//         phone: phone || '',
//         firebaseUID: firebaseUID || '',
//       };

//       const result = await usersCollections.insertOne(newUser);
//       res
//         .status(201)
//         .send({ message: 'User created', userId: result.insertedId });
//     });

//     /* ---------- Product APIs ---------- */
//     app.get('/products', verifyToken, async (req, res) => {
//       const products = await allProductsCollection.find().toArray();
//       res.send(products);
//     });

//     app.post('/products', verifyToken, async (req, res) => {
//       const newProduct = req.body;
//       const result = await allProductsCollection.insertOne(newProduct);
//       res.status(201).send({ message: 'Product added', id: result.insertedId });
//     });

//     app.put('/products/:id', verifyToken, async (req, res) => {
//       const { id } = req.params;
//       if (!ObjectId.isValid(id))
//         return res.status(400).send({ error: 'Invalid ID' });

//       const result = await allProductsCollection.updateOne(
//         { _id: new ObjectId(id) },
//         { $set: req.body }
//       );

//       if (!result.matchedCount)
//         return res.status(404).send({ error: 'Product not found' });
//       res.send({ message: 'Product updated' });
//     });

//     app.delete('/products/:id', verifyToken, async (req, res) => {
//       const { id } = req.params;
//       if (!ObjectId.isValid(id))
//         return res.status(400).send({ error: 'Invalid ID' });

//       const result = await allProductsCollection.deleteOne({
//         _id: new ObjectId(id),
//       });
//       if (!result.deletedCount)
//         return res.status(404).send({ error: 'Product not found' });
//       res.send({ message: 'Product deleted' });
//     });

//     /* ---------- Orders APIs ---------- */
//     app.get('/orders', verifyToken, async (req, res) => {
//       const orders = await ordersCollections.find().toArray();
//       res.send(orders);
//     });

//     app.post('/orders', verifyToken, async (req, res) => {
//       const newOrder = req.body;
//       const orderResult = await ordersCollections.insertOne(newOrder);
//       // console.log('tok tok token', req.cookies.token);

//       // Update stock
//       for (const item of newOrder.items || []) {
//         if (!item._id) continue;
//         const product = await allProductsCollection.findOne({
//           _id: new ObjectId(item._id),
//         });
//         if (!product) continue;
//         const newStock = Math.max(0, (product.stock || 0) - item.quantity);
//         await allProductsCollection.updateOne(
//           { _id: new ObjectId(item._id) },
//           { $set: { stock: newStock } }
//         );
//       }

//       // Daily sell update
//       const today = new Date();
//       const dateKey = today.toISOString().split('T')[0];
//       const orderTotal = newOrder.total || 0;

//       await dailySellCollection.updateOne(
//         { date: dateKey },
//         {
//           $inc: { totalSell: orderTotal },
//           $push: { orders: orderResult.insertedId },
//         },
//         { upsert: true }
//       );

//       // Monthly sell update
//       const monthKey = `${today.getFullYear()}-${today.getMonth() + 1}`;
//       await monthlySellCollection.updateOne(
//         { month: monthKey },
//         {
//           $inc: { totalSell: orderTotal },
//           $push: { orders: orderResult.insertedId },
//         },
//         { upsert: true }
//       );

//       res.status(201).send({
//         message: 'Order placed & sales updated',
//         orderId: orderResult.insertedId,
//       });
//     });

//     /* ---------- Daily & Monthly Sell APIs ---------- */
//     app.get('/daily-sell', verifyToken, async (req, res) => {
//       const records = await dailySellCollection.find().toArray();
//       res.send(records);
//     });

//     app.get('/monthly-sell', verifyToken, async (req, res) => {
//       const records = await monthlySellCollection.find().toArray();
//       res.send(records);
//     });

//     /* ---------- Monthly Target APIs ---------- */
//     app.get('/monthly-target', verifyToken, async (req, res) => {
//       const month = req.query.month;
//       // console.log('All cookies:', req.cookies);
//       // console.log('Token:', req.cookies?.token);
//       if (!month) return res.status(400).send({ message: 'Month is required' });

//       const targetRecord = await monthlyTargetCollection.findOne({ month });
//       if (!targetRecord)
//         return res.status(404).send({ message: 'No target found' });
//       res.send(targetRecord);
//     });

//     app.post('/monthly-target', verifyToken, async (req, res) => {
//       const { month, value } = req.body;
//       if (!month || value == null)
//         return res.status(400).send({ message: 'Month & value required' });

//       const result = await monthlyTargetCollection.findOneAndUpdate(
//         { month },
//         { $set: { value } },
//         { upsert: true, returnDocument: 'after' }
//       );
//       res.send({ message: 'Monthly target set/updated', target: result.value });
//     });

//     await client.db('admin').command({ ping: 1 });
//     console.log('✅ Connected to MongoDB!');
//   } finally {
//     // keep connection alive
//   }
// }

// run().catch(console.dir);

// /* ---------- Global Error Handler ---------- */
// app.use((err, req, res, next) => {
//   console.error('Unhandled Error:', err.stack);
//   res.status(500).send({ error: 'Something went wrong!' });
// });

// /* ---------- Start Server ---------- */
// app.listen(port, () => {
//   console.log(`🚀 Server running on port: ${port}`);
// });
//...............with jwt end.........................

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 5000;
/* ---------- Middleware ---------- */
const allowedOrigins = [process.env.CLIENT_URL, process.env.PROD_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

/* ---------- MongoDB Setup ---------- */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@skenterprise.bvccnzb.mongodb.net/?retryWrites=true&w=majority&appName=skenterprise`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db('sk-enterprise-DB');

    const allProductsCollection = db.collection('allProducts');
    const usersCollections = db.collection('users');
    const ordersCollections = db.collection('orders');
    const dailySellCollection = db.collection('dailySell');
    const monthlySellCollection = db.collection('monthlySell');
    const monthlyTargetCollection = db.collection('monthlyTarget');
    const shortProductListCollection = db.collection('shortProductList');

    /* ---------- Public Test ---------- */
    app.get('/', (req, res) => res.send('SK Enterprise server is running ✅'));

    /* ---------- User APIs ---------- */
    app.get('/users', async (req, res) => {
      const users = await usersCollections.find().toArray();
      res.send(users);
    });

    app.get('/user/:email', async (req, res) => {
      const user = await usersCollections.findOne({ email: req.params.email });
      if (!user) return res.status(404).send({ message: 'User not found' });
      res.send(user);
    });

    app.post('/users', async (req, res) => {
      const {
        name,
        email,
        password,
        photoURL,
        role,
        verify,
        phone,
        firebaseUID,
      } = req.body;

      const existingUser = await usersCollections.findOne({ email });
      if (existingUser)
        return res.status(400).send({ error: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = {
        name,
        email,
        password: hashedPassword,
        photoURL: photoURL || '',
        role: role || 'user',
        verify: verify || false,
        phone: phone || '',
        firebaseUID: firebaseUID || '',
      };

      const result = await usersCollections.insertOne(newUser);
      res
        .status(201)
        .send({ message: 'User created', userId: result.insertedId });
    });

    /* ---------- Product APIs ---------- */
    app.get('/products', async (req, res) => {
      const products = await allProductsCollection.find().toArray();
      res.send(products);
    });

    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      const result = await allProductsCollection.insertOne(newProduct);
      res.status(201).send({ message: 'Product added', id: result.insertedId });
    });

    app.put('/products/:id', async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id))
        return res.status(400).send({ error: 'Invalid ID' });

      const result = await allProductsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: req.body }
      );

      if (!result.matchedCount)
        return res.status(404).send({ error: 'Product not found' });
      res.send({ message: 'Product updated' });
    });

    app.delete('/products/:id', async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id))
        return res.status(400).send({ error: 'Invalid ID' });

      const result = await allProductsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (!result.deletedCount)
        return res.status(404).send({ error: 'Product not found' });
      res.send({ message: 'Product deleted' });
    });

    /* ---------- Orders APIs ---------- */
    app.get('/orders', async (req, res) => {
      const orders = await ordersCollections.find().toArray();
      res.send(orders);
    });

    app.post('/orders', async (req, res) => {
      const newOrder = req.body;
      const orderResult = await ordersCollections.insertOne(newOrder);

      // Update stock
      for (const item of newOrder.items || []) {
        if (!item._id) continue;
        const product = await allProductsCollection.findOne({
          _id: new ObjectId(item._id),
        });
        if (!product) continue;
        const newStock = Math.max(0, (product.stock || 0) - item.quantity);
        await allProductsCollection.updateOne(
          { _id: new ObjectId(item._id) },
          { $set: { stock: newStock } }
        );
      }

      // Daily sell update
      const today = new Date();
      const dateKey = today.toISOString().split('T')[0];
      const orderTotal = newOrder.total || 0;

      await dailySellCollection.updateOne(
        { date: dateKey },
        {
          $inc: { totalSell: orderTotal },
          $push: { orders: orderResult.insertedId },
        },
        { upsert: true }
      );

      // Monthly sell update
      const monthKey = `${today.getFullYear()}-${today.getMonth() + 1}`;
      await monthlySellCollection.updateOne(
        { month: monthKey },
        {
          $inc: { totalSell: orderTotal },
          $push: { orders: orderResult.insertedId },
        },
        { upsert: true }
      );

      res.status(201).send({
        message: 'Order placed & sales updated',
        orderId: orderResult.insertedId,
      });
    });

    /* ---------- Daily & Monthly Sell APIs ---------- */
    app.get('/daily-sell', async (req, res) => {
      const records = await dailySellCollection.find().toArray();
      res.send(records);
    });

    app.get('/monthly-sell', async (req, res) => {
      const records = await monthlySellCollection.find().toArray();
      res.send(records);
    });

    /* ---------- Monthly Target APIs ---------- */
    app.get('/monthly-target', async (req, res) => {
      const month = req.query.month;
      if (!month) return res.status(400).send({ message: 'Month is required' });

      const targetRecord = await monthlyTargetCollection.findOne({ month });
      if (!targetRecord)
        return res.status(404).send({ message: 'No target found' });
      res.send(targetRecord);
    });

    app.post('/monthly-target', async (req, res) => {
      const { month, value } = req.body;
      if (!month || value == null)
        return res.status(400).send({ message: 'Month & value required' });

      const result = await monthlyTargetCollection.findOneAndUpdate(
        { month },
        { $set: { value } },
        { upsert: true, returnDocument: 'after' }
      );
      res.send({ message: 'Monthly target set/updated', target: result.value });
    });

    /* Short List Product api start */
    app.post('/shortProductList', async (req, res) => {
      const product = req.body; // { name, quantity, status }
      if (!product.name || !product.quantity) {
        return res.status(400).send({ message: 'Name and Quantity required' });
      }

      // by default add "pending" if status not provided
      const newProduct = {
        ...product,
        status: product.status || 'pending',
      };

      const result = await shortProductListCollection.insertOne(newProduct);
      res.send(result);
    });

    app.get('/shortProductList', async (req, res) => {
      const products = await shortProductListCollection.find().toArray();
      res.send(products);
    });

    // ✅ Short product update (mark as Done)
    app.patch('/shortProductList/:id', async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ID' });
      }

      const result = await shortProductListCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status } }
      );

      if (!result.matchedCount) {
        return res.status(404).send({ error: 'Short Product Not Found' });
      }

      res.send({ message: 'Updated successfully', status });
    });

    // ✅ Short product delete method
    app.delete('/shortProductList/:id', async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ID' });
      }

      const result = await shortProductListCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (!result.deletedCount)
        return res.status(404).send({ error: 'Short Product Not Found' });

      res.send({ message: 'Deleted successfully' });
    });
    /* Short List Product api end */

    // await client.db('admin').command({ ping: 1 });
    // console.log('✅ Connected to MongoDB!');
  } finally {
    // keep connection alive
  }
}

run().catch(console.dir);

/* ---------- Global Error Handler ---------- */
// app.use((err, req, res, next) => {
//   console.error('Unhandled Error:', err.stack);
//   res.status(500).send({ error: 'Something went wrong!' });
// });

/* ---------- Start Server ---------- */
app.listen(port, () => {
  console.log(`🚀 Server running on port: ${port}`);
});
