


1) What is the difference between var, let, and const?
Answer: 
- var → function scoped, can re-declare & update, hoisted (initialized as undefined).
- let → block scoped, can update but not re-declare in same scope.
- const → block scoped, cannot update or re-declare, must be initialized.

2) What is the difference between map(), forEach(), and filter()?
Answer:
- map() → creates a new array with transformed elements.
- forEach() → just loops through array, doesn’t return anything.
- filter() → creates a new array with elements that match a condition.

3) What are arrow functions in ES6?
Answer:
- Shorter way to write functions. Example: const add = (a, b) => a + b;
- Arrow functions don’t have their own "this" → they use lexical this.

4) How does destructuring assignment work in ES6?
Answer:
- Easy way to unpack values from arrays/objects.
  Example:
    const [a, b] = [1, 2];   // a=1, b=2
    const {name, age} = {name: "John", age: 25};

5) Explain template literals in ES6. How are they different from string concatenation?
Answer:
- Use backticks (` `) instead of quotes.
- Allow multiline strings + string interpolation with ${}.
  Example:
    const name = "John";
    console.log(`Hello, ${name}!`);
- Easier and cleaner than "Hello, " + name + "!"
