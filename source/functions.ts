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
