import http from "k6/http";

export const options = {
  vus: 3, // Key for Smoke test. Keep it at 2, 3, max 5 VUs
  duration: "5s", // This can be shorter or just a few iterations
};

export default function () {
  const r = Math.random();
  r < 0.3
    ? http.get("http://localhost:3000")
    : http.get(`http://localhost:3000/path/${Math.round(r * 100)}`);
}
