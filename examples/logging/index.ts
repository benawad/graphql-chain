import { GraphQLServer } from "graphql-yoga";
import { IResolvers } from "graphql-yoga/dist/types";
import { MiddlewareResolver, chain } from "../../src/index";

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;

const loggingMiddleware: MiddlewareResolver = (next, _, args) => {
  console.log("args: ", args);
  return next();
};

const helloMiddleware = chain([loggingMiddleware]);

const resolvers: IResolvers = {
  Query: {
    hello: helloMiddleware((_, { name }) => `Hello ${name || "World"}`)
  }
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on localhost:4000"));
