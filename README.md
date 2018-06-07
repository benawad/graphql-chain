# GraphQL Chain

Create GraphQL middleware that resembles how Express middleware works.

## Install

```
yarn add graphql-chain
```

## How to use

### Step 1

Create middleware

```js
const validationMiddleware: MiddlewareResolver = (
  next,
  parent,
  args,
  context,
  info
) => {
  if (args.name.length > 10) {
    throw new Error("too long");
  }

  return next();
};
```

It has access to all the regular parameters a resolver gets plus a `next` parameter at the beginning which you call and return to call the next middleware or resolver.

You don't always have to call the next middleware or resolver though. This can be helpful if you want create a caching middleware:

```js
const cachingMiddleware: MiddlewareResolver = async (next, _, args) => {
  const data = await redis.get("hello:cache");
  if (data) {
    // found data in the cache, so return early
    console.log("CACHE HIT");
    return data;
  }
  // did not find data, so call the next middleware
  console.log("CACHE MISS");
  const result = await next();
  // set cache for next call
  await redis.set("hello:cache", result);
  return result;
};
```

You can also change the value of the arguments and then use them later

```js
const getUserMiddleware: MiddlewareResolver = async (next, _, __, context) => {
  if (validToken(context.authToken)) {
    // you can add properties to context that you can use later
    context.user = await getUser(context.authToken);
  }

  return next();
};
```

So you can then have a middleware that checks the user

```js
const authorizationMiddleware: MiddlewareResolver = (next, _, __, context) => {
  if (!context.user || !context.user.admin) {
    throw new Error("not authorized");
  }

  return next();
};
```

### Step 2

Chain as many middlewares together as you like

```js
import { chain } from "graphql-chain";

const helloMiddleware = chain([
  getUserMiddleware,
  authorizationMiddleware,
  validationMiddleware
]);
```

### Step 3

Wrap the resolver you want the middleware to run on

```js
const resolvers: IResolvers = {
  Query: {
    hello: helloMiddleware((_, { name }) => `Hello ${name || "World"}`)
  }
};
```

The execution sequence will be `getUserMiddleware` -> `authorizationMiddleware` -> `validationMiddleware` -> `hello`

Checkout the `examples` directory for complete examples
