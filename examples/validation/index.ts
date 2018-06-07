import { GraphQLServer } from "graphql-yoga";
import { IResolvers } from "graphql-yoga/dist/types";
import { MiddlewareResolver, chain } from "../../src/index";

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;

const validationMiddleware: MiddlewareResolver = (next, _, args) => {
  if (args.name.length > 10) {
    throw new Error("too long");
  }

  return next();
};

const helloMiddleware = chain([validationMiddleware]);

const resolvers: IResolvers = {
  Query: {
    hello: helloMiddleware((_, { name }) => `Hello ${name || "World"}`)
  }
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on localhost:4000"));
