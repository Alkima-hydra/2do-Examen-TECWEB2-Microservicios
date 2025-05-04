const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./graphql');
const { PORT } = require('./config');

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`Servidor listo en ${url}`);
});