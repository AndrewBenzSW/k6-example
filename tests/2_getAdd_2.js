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
