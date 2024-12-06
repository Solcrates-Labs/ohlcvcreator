const server = require("../index.js");

// Basic testing using jest
// Import functions here using require when exported from index.js file(using module.exports)

// So probably this jest testing will be done to test how this makeshift data(from this) is corresponding with the actual right data(geckoterminal api)

// Will add tests later

test("", async () => {
  const response = await inject(server, {
    method: "GET",
    url: "/test-api/HARAMBE/time/1m",
    headers: {
      Accept: "application/json",
    },
  });
  const data = response.json();
  console.log(data);
});
