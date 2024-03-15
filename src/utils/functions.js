async function uniqueSix() {
  return Math.floor(Math.random() * 900000) + 100000;
}

async function ShortCode(inputString) {
  // Check if the string has at least two characters
  if (inputString.length >= 2) {
      // Extract the first two characters and convert them to uppercase
      const firstTwoUpperCase = inputString.substring(0, 2).toUpperCase();
      return firstTwoUpperCase;
  } else {
      // If the string has less than two characters, return the original string
      return inputString.toUpperCase();
  }
}

async function expiryDate() {
  const currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() + 1);

  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');

  return `${day}-${month}-${year}`;
}

module.exports = {
  uniqueSix,
  ShortCode,
  expiryDate
};
