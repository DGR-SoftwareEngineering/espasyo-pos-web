type ArgumentTypes<F extends Function> = F extends (...args: infer A) => unknown
  ? A
  : never;

type AsyncFunction<A = unknown, o = unknown> = (...args: A) => Promise<O>;

type Nullable<T> = { [P in keyof T]: T[P] | null };
declare module "*.css";
