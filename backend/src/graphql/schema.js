const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type Policy {
    id: ID!
    policyNumber: String!
    type: String!
    premium: Float!
    coverage: Float!
    status: String!
    startDate: String!
    endDate: String!
    customer: User!
    createdAt: String!
    updatedAt: String!
  }

  type Claim {
    id: ID!
    claimNumber: String!
    policy: Policy!
    amount: Float!
    status: String!
    description: String!
    submittedDate: String!
    processedDate: String
    createdAt: String!
    updatedAt: String!
  }

  type Payment {
    id: ID!
    policy: Policy!
    amount: Float!
    dueDate: String!
    paidDate: String
    status: String!
    paymentMethod: String
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input SignupInput {
    name: String!
    email: String!
    password: String!
    role: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input PolicyInput {
    type: String!
    premium: Float!
    coverage: Float!
    startDate: String!
    endDate: String!
  }

  input ClaimInput {
    policyId: ID!
    amount: Float!
    description: String!
  }

  type Query {
    hello: String
    me: User
    policies: [Policy!]!
    policy(id: ID!): Policy
    claims: [Claim!]!
    claim(id: ID!): Claim
    payments: [Payment!]!
    payment(id: ID!): Payment
  }

  type Mutation {
    signup(input: SignupInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createPolicy(input: PolicyInput!): Policy!
    updatePolicy(id: ID!, input: PolicyInput!): Policy!
    deletePolicy(id: ID!): Boolean!
    createClaim(input: ClaimInput!): Claim!
    updateClaimStatus(id: ID!, status: String!): Claim!
    createPayment(policyId: ID!, amount: Float!, dueDate: String!): Payment!
    updatePaymentStatus(id: ID!, status: String!, paymentMethod: String): Payment!
  }
`;

module.exports = typeDefs;
