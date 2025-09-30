const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Policy = require('../models/PolicyProduct');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secure_jwt_secret_key_here_change_in_production';

// Helper function to get user from context
const getUserFromContext = (context) => {
  if (!context.user) {
    throw new Error('Authentication required');
  }
  return context.user;
};

const resolvers = {
  Query: {
    hello: () => 'Insurance Management GraphQL API is running',
    
    me: async (_, __, context) => {
      const user = getUserFromContext(context);
      return await User.findById(user._id).select('-passwordHash');
    },

    policies: async (_, __, context) => {
      const user = getUserFromContext(context);
      if (user.role === 'admin') {
        return await Policy.find().populate('customer');
      }
      return await Policy.find({ customer: user._id }).populate('customer');
    },

    policy: async (_, { id }, context) => {
      const user = getUserFromContext(context);
      const policy = await Policy.findById(id).populate('customer');
      if (!policy) {
        throw new Error('Policy not found');
      }
      if (user.role !== 'admin' && policy.customer._id.toString() !== user._id.toString()) {
        throw new Error('Access denied');
      }
      return policy;
    },

    claims: async (_, __, context) => {
      const user = getUserFromContext(context);
      if (user.role === 'admin') {
        return await Claim.find().populate('policy').populate('policy.customer');
      }
      const userPolicies = await Policy.find({ customer: user._id });
      const policyIds = userPolicies.map(p => p._id);
      return await Claim.find({ policy: { $in: policyIds } }).populate('policy').populate('policy.customer');
    },

    claim: async (_, { id }, context) => {
      const user = getUserFromContext(context);
      const claim = await Claim.findById(id).populate('policy').populate('policy.customer');
      if (!claim) {
        throw new Error('Claim not found');
      }
      if (user.role !== 'admin' && claim.policy.customer._id.toString() !== user._id.toString()) {
        throw new Error('Access denied');
      }
      return claim;
    },

    payments: async (_, __, context) => {
      const user = getUserFromContext(context);
      if (user.role === 'admin') {
        return await Payment.find().populate('policy').populate('policy.customer');
      }
      const userPolicies = await Policy.find({ customer: user._id });
      const policyIds = userPolicies.map(p => p._id);
      return await Payment.find({ policy: { $in: policyIds } }).populate('policy').populate('policy.customer');
    },

    payment: async (_, { id }, context) => {
      const user = getUserFromContext(context);
      const payment = await Payment.findById(id).populate('policy').populate('policy.customer');
      if (!payment) {
        throw new Error('Payment not found');
      }
      if (user.role !== 'admin' && payment.policy.customer._id.toString() !== user._id.toString()) {
        throw new Error('Access denied');
      }
      return payment;
    },
  },

  Mutation: {
    signup: async (_, { input }) => {
      const { name, email, password, role } = input;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({ name, email, passwordHash, role: role || 'customer' });
      await user.save();

      const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return { token, user };
    },

    login: async (_, { input }) => {
      const { email, password } = input;
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw new Error('Invalid password');
      }

      const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return { token, user };
    },

    createPolicy: async (_, { input }, context) => {
      const user = getUserFromContext(context);
      if (user.role !== 'admin' && user.role !== 'agent') {
        throw new Error('Insufficient permissions');
      }

      const policy = new Policy({
        ...input,
        customer: user._id,
        policyNumber: `POL-${Date.now()}`,
        status: 'active'
      });
      await policy.save();
      return await Policy.findById(policy._id).populate('customer');
    },

    updatePolicy: async (_, { id, input }, context) => {
      const user = getUserFromContext(context);
      const policy = await Policy.findById(id);
      if (!policy) {
        throw new Error('Policy not found');
      }
      if (user.role !== 'admin' && policy.customer.toString() !== user._id.toString()) {
        throw new Error('Access denied');
      }

      Object.assign(policy, input);
      await policy.save();
      return await Policy.findById(policy._id).populate('customer');
    },

    deletePolicy: async (_, { id }, context) => {
      const user = getUserFromContext(context);
      if (user.role !== 'admin') {
        throw new Error('Insufficient permissions');
      }

      const policy = await Policy.findByIdAndDelete(id);
      return !!policy;
    },

    createClaim: async (_, { input }, context) => {
      const user = getUserFromContext(context);
      const { policyId, amount, description } = input;

      const policy = await Policy.findById(policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }
      if (user.role !== 'admin' && policy.customer.toString() !== user._id.toString()) {
        throw new Error('Access denied');
      }

      const claim = new Claim({
        policy: policyId,
        amount,
        description,
        claimNumber: `CLM-${Date.now()}`,
        status: 'submitted',
        submittedDate: new Date().toISOString()
      });
      await claim.save();
      return await Claim.findById(claim._id).populate('policy').populate('policy.customer');
    },

    updateClaimStatus: async (_, { id, status }, context) => {
      const user = getUserFromContext(context);
      if (user.role !== 'admin' && user.role !== 'agent') {
        throw new Error('Insufficient permissions');
      }

      const claim = await Claim.findById(id);
      if (!claim) {
        throw new Error('Claim not found');
      }

      claim.status = status;
      if (status === 'approved' || status === 'rejected') {
        claim.processedDate = new Date().toISOString();
      }
      await claim.save();
      return await Claim.findById(claim._id).populate('policy').populate('policy.customer');
    },

    createPayment: async (_, { policyId, amount, dueDate }, context) => {
      const user = getUserFromContext(context);
      if (user.role !== 'admin' && user.role !== 'agent') {
        throw new Error('Insufficient permissions');
      }

      const policy = await Policy.findById(policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }

      const payment = new Payment({
        policy: policyId,
        amount,
        dueDate,
        status: 'pending'
      });
      await payment.save();
      return await Payment.findById(payment._id).populate('policy').populate('policy.customer');
    },

    updatePaymentStatus: async (_, { id, status, paymentMethod }, context) => {
      const user = getUserFromContext(context);
      const payment = await Payment.findById(id);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Check if user can update this payment
      const policy = await Policy.findById(payment.policy);
      if (user.role !== 'admin' && user.role !== 'agent' && policy.customer.toString() !== user._id.toString()) {
        throw new Error('Access denied');
      }

      payment.status = status;
      if (paymentMethod) {
        payment.paymentMethod = paymentMethod;
      }
      if (status === 'paid') {
        payment.paidDate = new Date().toISOString();
      }
      await payment.save();
      return await Payment.findById(payment._id).populate('policy').populate('policy.customer');
    },
  },
};

module.exports = resolvers;
