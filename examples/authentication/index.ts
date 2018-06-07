import { GraphQLServer } from "graphql-yoga";
import { IResolvers } from "graphql-yoga/dist/types";
import { MiddlewareResolver, chain } from "../../src/index";

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;

const validToken = async (token: string) => {
  // logic needed :)
  return true;
};

const getUser = async (token: string) => {
  // logic needed :)
  return { id: 5, email: "bob@bob.com", admin: true };
};

const getUserMiddleware: MiddlewareResolver = async (next, _, __, context) => {
  if (validToken(context.authToken)) {
    // you can add properties to context that you can use later
    context.user = await getUser(context.authToken);
  }

  return next();
};

const authorizationMiddleware: MiddlewareResolver = (next, _, __, context) => {
  if (!context.user || !context.user.admin) {
    throw new Error("not authorized");
  }

  return next();
};

const validationMiddleware: MiddlewareResolver = (next, _, args) => {
  if (args.name.length > 10) {
    throw new Error("too long");
  }

  return next();
};

const helloMiddleware = chain([
  getUserMiddleware,
  authorizationMiddleware,
  validationMiddleware
]);

const resolvers: IResolvers = {
  Query: {
    hello: helloMiddleware((_, { name }) => `Hello ${name || "World"}`)
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: ({ request }) => ({
    authToken: request.headers.authorization
  })
});
server.start(() => console.log("Server is running on localhost:4000"));
