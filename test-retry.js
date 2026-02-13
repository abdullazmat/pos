const http = require("http");

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/cron/arca/retry-pending?limit=1",
  method: "GET",
  headers: {
    "x-cron-secret": "local_cron_secret_change_me",
  },
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Body:", data);
  });
});

req.on("error", (e) => {
  console.error("Error:", e.message);
});

req.end();
