import http from "k6/http";
import { check, sleep } from "k6";

export default function () {
  const res = http.get("http://localhost:3000/add/1/1");

  check(res, {
    "returns 2": (r) => r.body === "2",
  });

  sleep(1);
}
