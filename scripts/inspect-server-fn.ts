import { createServerFn } from "@tanstack/react-start";

console.log("createServerFn implementation:");
console.log(createServerFn.toString());

console.log("\nStatic keys on createServerFn:", Object.keys(createServerFn));

const fn = createServerFn({ method: "GET" });
console.log("\nKeys on created fn instance:", Object.keys(fn));
console.log("Constructor name of fn instance:", fn.constructor.name);
console.log("Prototype name of fn instance:", Object.getPrototypeOf(fn)?.constructor?.name);

// Let's print the prototype methods
let proto = Object.getPrototypeOf(fn);
while (proto) {
  console.log("Proto level keys:", Object.getOwnPropertyNames(proto));
  proto = Object.getPrototypeOf(proto);
}
