const generate = require("meaningful-string");

let options = {
   numberUpto: 60,
   joinBy: ""
};

export function generateRandomNumber() {
   // Generate a random number between 0 and 1
   const randomNumber = Math.random();

   // If randomNumber is less than 0.5, return 1, else return 2
   return randomNumber < 0.5 ? 1 : 2;
}

export function generateUsername() {
   let x = generate.meaningful(options) as string;
   let _username = x.split("-");
   _username[1] = titleCase(_username[1]);
   return _username.join("");
}

export function titleCase(str: string) {
   return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
}

export function generateRandomTextAndNumbers(length: number) {
   const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   let randomString = "";

   for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset[randomIndex];
   }

   return randomString?.toLowerCase();
}

export function deepCopy(obj: any) {
   // If obj is not an object or is null, return it as is
   if (typeof obj !== "object" || obj === null) {
      return obj;
   }

   // Create an empty object or array to hold the copied properties
   const copy = Array.isArray(obj) ? [] : {};

   // Iterate over each property of the object
   for (let key in obj) {
      // Recursively copy nested objects or arrays
      (copy as any)[key] = deepCopy(obj[key]);
   }

   return copy;
}
