export function generateRandomNumber() {
  // Generate a random number between 0 and 1
  const randomNumber = Math.random();

  // If randomNumber is less than 0.5, return 1, else return 2
  return randomNumber < 0.5 ? 1 : 2;
}
