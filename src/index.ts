export type Resolver = (parent: any, args: any, context: any, info: any) => any;

export type Next = () => any;

export type MiddlewareResolver = (
  next: Next,
  parent: any,
  args: any,
  context: any,
  info: any
) => any;

export const chain = (middlewares: MiddlewareResolver[]) => (
  resolver: Resolver
) => (parent: any, args: any, context: any, info: any) => {
  const newMiddlewares = [...middlewares];
  const next: Next = () => {
    const middleware = newMiddlewares.shift();
    if (middleware) {
      return middleware(next, parent, args, context, info);
    }

    return resolver(parent, args, context, info);
  };

  return next();
};
