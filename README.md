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

### Speed

### Scriptability

### Tests as source

### Leverage existing skills


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
