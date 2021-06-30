# K6 Testing Tool

## What's the problem?

One of the reasons we build the Native Rating service is to provide accurate rates _faster_ than the carriers could provide them.  Naturally, we needed a way to not only prove that we achieved this goal, but to ensure that as we continued to develop the service, it stayed fast.

Speed is one concern, but accuracy is another.  We need to verify a huge number of rate permutations to ensure that we get the results we expect every time.

## Can't we just use JMeter?

When I was on the ShipWorks Hub team, we used JMeter to perform some end to end tests. It worked well enough, but it had some definite drawbacks. First, the learning curve is pretty steep. JMeter is a powerful tool but that means you'll need to wade through a lot of options to find what you need. For example, there are 22 different samplers for making requests!

Next, while it has a CLI test runner, the primary means of interaction with the tool is through the GUI. This is fine when you're exploring, but for performing repeatable, reusable tasks, it's less than ideal. Everyone is different, but I personally feel faster on the keyboard than on the mouse. Some things, like copying and pasting, can only be done in the way the GUI developers allow which can also get in the way.

Finally, JMeter is built on Java. This isn't objectively bad; but my team -- and I would suspect much of our organization -- has very little experience in Java. Dealing with VM configuration is not something I want to have to worry about when running tests.

The K6 team has [a writeup](https://k6.io/blog/k6-vs-jmeter/) on the pros and cons of each, and it's a good read if you want to know more. There are many other tools in this space and if you'd like more information on some of the competition, the K6 team has done [an analysis](https://k6.io/blog/comparing-best-open-source-load-testing-tools/) of each with some pros and cons. It's obviously biased, but the information is good.

## Why use K6?

There are many reasons to use K6 over other solutions, but I'm going to focus on some of the things that we found especially helpful while building the Native Rating functionality.

### Speed

K6 can run tests **very** fast. In fact, as you'll see in the examples later on, most K6 tests will use a sleep statement to slow it down a bit. I never had a problem with JMeter's performance, but it's nice to know I can write completely custom tests and not have to give a thought to how K6 will handle it. Which leads me to the second point...

### Programmability

Writing tests in K6 doesn't feel any different than writing any other code, which lets developers focus on the logic of the tests instead of how to work with the testing framework. This has allowed us to quickly throw together one-off tests as well as build more complex data driven tests using tools and techniques we were already familiar with. 

While testing the accuracy of the Native Rating solution, we pulled shipment data from Redshift into a CSV file and used that to generate test requests against the Native Rating service. Because the CSV data was available to the test code, we were able to easily compare the actual rate returned from the carrier with the rate that the Native Rating service returned. We then evolved the script so that it could use that Redshift data as well as data we generated from ShipEngine.

### Leverage existing skills

Because K6 tests are Javascript, we're able to leverage our existing development knowledge to write the tests. The actual K6 interface is relatively small, and the vast majority of test code we've written has been standard Javascript. This helps when trying to develop more involved tests because you can focus on what the test *logically* needs to do vs. what it *technically* needs to do.

### Statistics

When we first added K6 to our tool set, the initial draw was the automatic statistics that it generates. We have a performance goal that requires testing the P95 response time of the service. Using K6, we automatically get rich statistics for all the requests made, including a breakdown of the request into components such as connection, waiting, sending, and receiving time. These statistics include average, min, max, and P95 times among others.

With just a bit of extra work, you can create these same sorts of statistics for any piece of data beyond what's built in. But the nice thing is you don't _have_ to!

### Tests as source

To me, this is a no-brainer: source code all the things! When I pull latest and tests start breaking, I want to be able to easily diff the code *and* the tests. Some tools store their test definitions in XML, which is *technically* diffable, but it's not always easy. It can also make merges tougher, especially when the tool decides to change the order of elements when you save.

## Gotchas

Unfortunately, K6 is not perfect and does have a few gotchas. The primary issue I run into is that while K6 tests are written in Javascript, they are run through a custom Javascript runtime. Most of the time, this is totally transparent. Unfortunately, when I'm debugging a test and want to throw in a quick `console.dir(someObj)` line, I get a nasty reminder that this isn't a perfect environment because the `dir` function doesn't exist.

Related to this is the NPM package limitation. Unfortunately, K6 tests cannot use NPM packages. While this seems like a huge limitation, it actually hasn't been too bad. The K6 documentation has links to bundled versions of a few commonly used packages and they have documentation on how you can bundle most existing packages for use in K6 tests. The only real limitation is that the package cannot make use of built-in Node or browser functionality.

Finally, some of the errors can be misleading. I was running a test suite recently and got strange errors that made me think something in the test was broken. It turns out that the test was having problems connecting to the service and the error that was surfaced was a native Go error. You rarely have to care what language K6 was built with, but this is one time when it helps to keep that in mind.

## See it in action!

I've built an extremely simple API that we're going to use to learn the basics of what K6 can offer. I've created a tag in Github for each step so you can either start at the beginning and write the test code yourself, or you can read what needs to be done and check out the tag for the next step so that you can just run the tests without writing the code.

### Prerequisites

You will need to have a relatively recent version of [Node.js](https://nodejs.org/en/) installed to run the API. I'm using v12.16.0, so I can guarantee it will run on that version.

Next, we'll need to get K6. There are a few ways [to do this](https://k6.io/docs/getting-started/installation/). I would recommend just installing the binary using the instructions for your platform, but if you are comfortable with Docker, that is a viable approach as well.

Finally, we'll need to set up the API.  Start out by cloning the repository:
```bash
git clone git@github.com:AndrewBenzSW/k6-example.git
```

Now open another terminal that we'll use to run the API. In the new terminal, move into the app directory and install the node modules:
```bash
cd k6-example/app
npm install
```

Finally, start the service:
```bash
npm start
```

Once this starts, you should be able to ignore the terminal until you're ready to stop the application.

### 1. Hello World!

We'll start with the simplest possible test: make a GET request to our service and use the default timings. Create a directory called `tests` in the root of the repository and we'll create the following file.

##### **`tests/1_getHelloWorld.js`**
```js 
import http from "k6/http";
import { sleep } from "k6";

export default function () {
  http.get("http://localhost:3000");

  sleep(1);
}
```

This is what a basic K6 test looks like. As with any Javascript file, we start with the modules we want to use within the script. Then we define the default export for our test module, which K6 uses as the main code block that each virtual user (VU) will execute for each iteration of the test. Within the default function, the first line makes a get request to the root of our API. The second line causes the script to sleep for 1 second before finishing. It isn't strictly necessary to execute the sleep command, but there is [an explanation](https://community.k6.io/t/how-sleep-impacts-overall-duration-of-the-test/404) on the K6 support forum explaining why you might want to do it.

Let's run the test and see what happens:

```bash
k6 run tests/getHelloWorld.js
```

The test should take a few seconds to run and you should be presented with a screen that looks similar to the screenshot below. You can see the various components of the request and the statistics associated with it. It's not very interesting yet because we've only made one request. We'll do more requests in the next example.

TODO: ADD SCREENSHOT

### 2. Validate Results

Next, we're going to write an end-to-end integration test using K6. This test is just going to add a set of numbers, but since it's making a request and examining the response, what is happening behind the scenes can be as simple or complex as necessary. For this test, create the following file in the `tests` directory

##### **`tests/2_getAdd_1.js`**
```js 
import http from "k6/http";
import { check, sleep } from "k6";

export default function () {
  const res = http.get("http://localhost:3000/add/1/1");

  check(res, {
    "returns 2": (r) => r.body === "2",
  });

  sleep(1);
}
```

What's new here is that we're capturing the response and performing a check, which is a K6 function. In this case, we're passing in the result and comparing the body to the expected value. You could perform any number of tests on the result object, though, including testing for a 200 status code or the presence of a header value. Go ahead and run the test:

```bash
k6 run tests/2_getAdd_1.js
```

TODO: Add screenshot

Success! We've just verified that 1 + 1 = 2. That's not a very thorough test, though, so let's add a few more requests:

##### **`tests/2_getAdd_2.js`**
```js 
import http from "k6/http";
import { check, sleep } from "k6";

// Set up our test data
const tests = [
  { addends: [1, 1], sum: "2" },
  { addends: [4, 8], sum: "12" },
  { addends: [-1, -1], sum: "-2" },
  { addends: [1000, 1], sum: "1001" },
];

export default function () {
  // Go through each test one by one
  for (const test of tests) {
    const res = http.get(
      `http://localhost:3000/add/${test.addends[0]}/${test.addends[1]}`
    );

    check(res, {
      "returns correct sum": (r) => r.body === test.sum,
    });

    sleep(0.2);
  }
}
```

As you can see, we didn't use anything new from K6 to test more data points: we just created an array of objects and looped through them!

### 3. Test a POST

TODO: Build example that makes a post request

### 4. Custom Statistics

TODO: Build example that uses custom statistics

### 5. FAILURE!

TODO: Build example that sets thresholds that aren't met

### 6. Bundling and Typescript

TODO: Build example that uses typescript and an NPM module

## Conclusion

I hope this has been a helpful overview of what K6 is and what it can offer. I wish I'd known about it when working on ShipWorks Hub because we used JMeter quite a bit for integration testing and I think K6 would have made this so much easier. If you'd like any more info or would like to see specifics of how we use K6 in our current projects, feel free to drop me a line.

