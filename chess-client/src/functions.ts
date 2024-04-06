const generate = require("meaningful-string");

let options = {
  numberUpto: 60,
  joinBy: "",
};

export function generateUsername() {
  let x = generate.meaningful(options) as string;
  let _username = x.split("-");
  _username[1] = titleCase(_username[1]);
  return _username.join("");
}

export function titleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
}

export function deepCopy<T, U = T extends Array<infer V> ? V : never>(source: T): T {
  if (Array.isArray(source)) {
     return source.map((item) => deepCopy(item)) as T & U[];
  }

  if (source instanceof Date) {
     return new Date(source.getTime()) as T & Date;
  }

  if (source && typeof source === "object") {
     return (Object.getOwnPropertyNames(source) as (keyof T)[]).reduce<T>(
        (o, prop) => {
           Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop)!);
           o[prop] = deepCopy(source[prop]);
           return o;
        },
        Object.create(Object.getPrototypeOf(source))
     );
  }

  return source;
}


export function onMessage(event: MessageEvent<any>) {}
