export function customLogger(queryString, queryObject) {
  console.log(queryString); // outputs a string
  console.log(queryObject.bind); // outputs an array
}
