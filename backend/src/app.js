const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');

const authRoutes = require('./routes/auth.routes');
const policiesRoutes = require('./routes/policies.routes');
const claimsRoutes = require('./routes/claims.routes');
const paymentsRoutes = require('./routes/payments.routes');
const adminRoutes = require('./routes/admin.routes');

const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/policies', policiesRoutes);
app.use('/api/v1/claims', claimsRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/', (req, res) => res.json({ message: 'Insurance API running' }));

// Apollo Server
async function startApollo() {
  const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    context: async ({ req }) => {
      // Get the user token from the headers
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const User = require('./models/User');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.sub).select('-passwordHash');
          return { user };
        } catch (error) {
          // Token is invalid, but we don't throw here
          // Let individual resolvers handle authentication
        }
      }
      
      return {};
    },
    introspection: process.env.NODE_ENV !== 'production',
    playground: process.env.NODE_ENV !== 'production'
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
}

startApollo();

module.exports = app;
