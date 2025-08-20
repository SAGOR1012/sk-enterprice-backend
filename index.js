const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const bcrypt = require('bcrypt'); // <-- Added bcrypt for hashing

const app = express();
const port = process.env.PORT || 5000;

/* middleware */
app.use(cors());
app.use(express.json()); // To parse JSON bodies

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

    /* MongoDB collections Start */
    const allProductsCollection = client
      .db('sk-enterprise-DB')
      .collection('allProducts');
    const usersCollections = client.db('sk-enterprise-DB').collection('users');
    /* MongoDB collections End */

    app.get('/', (req, res) => {
      res.send('sk server on');
    });
    /* ====================== User API ====================== */
    /* Find all users route  */
    app.get('/users', async (req, res) => {
      try {
        const allUsers = await usersCollections.find().toArray();
        res.send(allUsers);
      } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Failed to fetch users' });
      }
    });
    // single user by email
    app.get('/user/:email', async (req, res) => {
      try {
        const user = await usersCollections.findOne({
          email: req.params.email,
        });
        if (!user) return res.status(404).send({ message: 'User not found ' });
      } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Failed to fetch users' });
      }
    });
    /* ====================== User API ====================== */
    // Create a new user (signup) with password hashing
    app.post('/users', async (req, res) => {
      try {
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

        // Check if email already exists
        const existingUser = await usersCollections.findOne({ email });
        if (existingUser) {
          return res.status(400).send({ error: 'User already exists' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user object
        const newUser = {
          name,
          email,
          password: hashedPassword, // Store hashed password
          photoURL: photoURL || '',
          role: role || 'user',
          verify: verify || false,
          phone: phone || '',
          firebaseUID: firebaseUID || '',
        };

        const result = await usersCollections.insertOne(newUser);
        res.status(201).send({
          message: 'User created successfully',
          userId: result.insertedId,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to create user' });
      }
    });

    /* ====================== Product related API ====================== */
    // Get all products
    app.get('/products', async (req, res) => {
      try {
        const products = await allProductsCollection.find().toArray();
        res.send(products);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch products' });
      }
    });

    // app.get('/products', async (req, res) => {
    //   const result = await allProductsCollection.find().toArray();
    //   res.send(result);
    // });

    // Add a new product
    app.post('/products', async (req, res) => {
      try {
        const newProduct = req.body;
        const result = await allProductsCollection.insertOne(newProduct);
        res.status(201).send({
          message: 'Product added successfully',
          productId: result.insertedId,
        });
      } catch (error) {
        res.status(500).send({ error: 'Failed to add product' });
      }
    });

    // Update a product by ID

    app.put('/products/:id', async (req, res) => {
      const { id } = req.params;
      const updatedProduct = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid product ID' });
      }

      try {
        const result = await allProductsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedProduct }
        );
        if (result.matchedCount === 0) {
          return res.status(404).send({ error: 'Product not found' });
        }
        res.send({ message: 'Product updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to update product' });
      }
    });

    //! Delete a product by ID
    // Delete
    app.delete('/products/:id', async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid product ID' });
      }
      try {
        const result = await allProductsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).send({ error: 'Product not found' });
        }
        res.send({ message: 'Product deleted successfully' });
      } catch (error) {
        console.error(error); // <-- log error
        res.status(500).send({ error: 'Failed to delete product' });
      }
    });

    /* ====================== Product related API END====================== */

    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running on port : ${port}`);
});
