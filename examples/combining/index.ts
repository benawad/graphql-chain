import { GraphQLServer } from "graphql-yoga";
import { IResolvers } from "graphql-yoga/dist/types";
import * as Redis from "ioredis";
import { MiddlewareResolver, chain } from "../../src/index";

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;

const redis = new Redis();

const cachingMiddleware: (
  getKey: (args: any) => string
) => MiddlewareResolver = getKey => async (next, _, args) => {
  const key = getKey(args);
  const data = await redis.get(key);
  if (data) {
    console.log("CACHE HIT");
    return data;
  }
  console.log("CACHE MISS");
  const result = await next();
  // set cache
  await redis.set(key, result);
  return result;
};

const loggingMiddleware: MiddlewareResolver = (next, _, args) => {
  console.log("args: ", args);
  return next();
};

const validationMiddleware: MiddlewareResolver = (next, _, args) => {
  if (args.name.length > 10) {
    throw new Error("too long");
  }

  return next();
};

const helloMiddleware = chain([
  loggingMiddleware,
  validationMiddleware,
  cachingMiddleware(args => `hello:${args.name}`)
]);

const resolvers: IResolvers = {
  Query: {
    // cache based on the name argument passing in
    hello: helloMiddleware((_, { name }) => `Hello ${name || "World"}`)
  }
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on localhost:4000"));
