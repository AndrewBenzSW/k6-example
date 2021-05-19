# K6 Example App

This is a simple Express app that is meant to be used to learn the basics of K6 testing.

## Running the app

After cloning the repo, you can run the app by running the following commands:

```
npm install
npm start
```

This will start the app on port 3000.  There is no error handling, retry logic, or any other real-world application concerns because I didn't want to add anything that wasn't necessary for the K6 examples.  Please don't take any of this code as best practices, or even as something you should do in your own code!

## API

### GET /

Returns the string "Hello World!".

### GET /add/:value/:value

Gets the sum of the two values passed in. For example, if you request `/add/3/7`, then you'll get back the string `10`.

### POST /sum

Sums all the passed in values and returns the result.

Assumes a JSON body with the format `{"addends": [value, ..., value]}` where `value` must be a number.  The `addends` array can contain any amount of numbers.  The response will be in the format `{"result": sum}` where sum is the sum of all the addends.

### GET /random

Gets a random integer between 1 and 10, inclusive.

### GET /performance

Returns a response after waiting between 25 and 250 milliseconds.  This can be used to test performance metrics.