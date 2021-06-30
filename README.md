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

### Hello World!

We'll start with the simplest possible test: make a GET request to our service and use the default timings. Create a directory called `tests` in the root of the repository and we'll create the following file.

##### **`tests/getHelloWorld.js`**
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
