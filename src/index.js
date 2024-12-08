const solana = require("@solana/web3.js");
const dotenv = require("dotenv");
const fs = require("fs");
const fetch = require("cross-fetch");
const chalk = require("chalk");
const express = require("express");
const expressApp = express();
expressApp.use(express.json());

// GLOBAL VARIABLES LIST
const address = new solana.PublicKey(
  "Fch1oixTPri8zxBnmdCEADoJW2toyFHxqDZacQkwdvSP" // HARAMBE - change this to your desired solana token mint address
);

// clean this mess later
let connection, tokenDecimals, rpcUrl, port;
let slotChecker = true;
let programPrimer = false;
let firstSlot;
let secondSlot;
let timeSeconds;
let timeMinutes;
let timeHours;

let volume1mArray = [];
let volume5mArray = [];
let volume15mArray = [];
let volume1hrArray = [];
let volume4hrArray = [];

let firstTriggerOHLC = false;
let usdPriceArray = [];
let openPrice1mArray = [];
let highPrice1mArray = [];
let lowPrice1mArray = [];
let closePrice1mArray = [];

let openPrice5mArray = [];
let highPrice5mArray = [];
let lowPrice5mArray = [];
let closePrice5mArray = [];

let openPrice15mArray = [];
let highPrice15mArray = [];
let lowPrice15mArray = [];
let closePrice15mArray = [];

let openPrice1hrArray = [];
let highPrice1hrArray = [];
let lowPrice1hrArray = [];
let closePrice1hrArray = [];

let openPrice4hrArray = [];
let highPrice4hrArray = [];
let lowPrice4hrArray = [];
let closePrice4hrArray = [];

async function env() {
  try {
    const envFilePath = ".env";
    const defaultEnvContent = `# Please fill in the following environment variables\n# You can get RPC url from Solana RPC providers
    # (recommended - allnodes.com, helius.dev)\nRPC_URL=\n# Program will listen to the port provided, must be forwarded if you want to use 
    # this program outside of your localhost\nPORT=`;
    try {
      if (!fs.existsSync(envFilePath)) {
        fs.writeFileSync(envFilePath, defaultEnvContent, "utf8");
        console.log(
          chalk.green(
            ".env file has been created in the root folder of the program. Please fill in RPC_URL and PORT variables"
          )
        );
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red("Cannot create ENV file:", error));
      process.exit(1);
    }

    dotenv.config();
    if (!process.env.RPC_URL || !process.env.PORT) {
      console.error(chalk.red("Cannot find RPC_URL and/or PORT variables"));
      process.exit(1);
    }
  } catch (error) {
    console.log(
      chalk.red(
        "Something is wrong with the provided info. Please check if you set everything correctly."
      )
    );
    process.exit(1);
  }
  return [process.env.RPC_URL, process.env.PORT];
}

async function connector() {
  [rpcUrl, port] = await env();
  try {
    connection = new solana.Connection(rpcUrl, "confirmed", {
      // This can be used to interact to rpc
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 10000,
    });

    if (typeof connection != "undefined") {
      console.log(
        chalk.yellow(
          "The program will start gathering data on 4:00, 8:00, 12:00, 16:00, 20:00, 24:00, depending on UTC time.\n"
        )
      );
    }

    let tokenSupply = await connection.getTokenSupply(address);
    tokenDecimals = tokenSupply.value.decimals; // token decimals fetch
    // console.log(tokenDecimals);

    return connection, tokenDecimals, rpcUrl, port;
  } catch (error) {
    console.error("Unable to connect to RPC \n" + error);
  }
}

async function UTCExecutor() {
  // This function should be a primer of the program. UTC minute controlled
  try {
    let time = new Date();
    timeSeconds = time.getUTCSeconds();
    timeHours = time.getUTCHours();
    timeMinutes = time.getUTCMinutes();

    if (
      (timeHours == 3 &&
        timeMinutes == 59 &&
        timeSeconds == 59 &&
        !programPrimer) ||
      (timeHours == 7 &&
        timeMinutes == 59 &&
        timeSeconds == 59 &&
        !programPrimer) ||
      (timeHours == 11 &&
        timeMinutes == 59 &&
        timeSeconds == 59 &&
        !programPrimer) ||
      (timeHours == 15 &&
        timeMinutes == 59 &&
        timeSeconds == 59 &&
        !programPrimer) ||
      (timeHours == 19 &&
        timeMinutes == 59 &&
        timeSeconds == 59 &&
        !programPrimer) ||
      (timeHours == 23 &&
        timeMinutes == 59 &&
        timeSeconds == 59 &&
        !programPrimer)
    ) {
      programPrimer = true;
      console.log(chalk.green("Started!"));
      fetcher();
    }

    if (timeSeconds == 0 && programPrimer == true) {
      getVolume();
      await new Promise((wait) => setTimeout(wait, 1000));
    }
  } catch (error) {
    console.log("UTCExecutor error!");
  } finally {
    setTimeout(UTCExecutor, 100);
  }
}

async function fetcher() {
  // Not very precise
  try {
    const response = await fetch(`https://api.jup.ag/price/v2?ids=${address}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    const data = await response.json();
    let usdPrice = data.data[address].price;
    usdPriceArray.unshift(usdPrice);

    if (timeMinutes == 1 && !firstTriggerOHLC) {
      firstTriggerOHLC = true;
    }

    // todo - clean this mess
    let priceOpen = usdPriceArray[0];
    let priceOpenInteger = parseFloat(priceOpen); // parsed to integer(was string)
    let priceHigh = Math.max(...usdPriceArray);
    let priceLow = Math.min(...usdPriceArray);
    let priceClose = usdPriceArray.reverse();
    priceClose = priceClose[0]; // parsed to integer(was string)
    let priceCloseInteger = parseFloat(priceClose);

    if (
      (timeSeconds == 59 && firstTriggerOHLC) ||
      (timeSeconds == 0 && firstTriggerOHLC)
    ) {
      await new Promise((wait) => setTimeout(wait, 2000));
      openPrice1mArray.unshift(priceOpenInteger);
      highPrice1mArray.unshift(priceHigh);
      lowPrice1mArray.unshift(priceLow);
      closePrice1mArray.unshift(priceCloseInteger);

      // 5 MINUTES

      if (openPrice1mArray.length % 5 === 0) {
        let openPrice5m = openPrice1mArray[4]; // So the difference between volume5m and volume5mArray is that volume5m stores one integer for 5m and then it is pushed into actual volume5mArray which is array that holds all 5m data
        openPrice5mArray.unshift(openPrice5m);
      }

      if (highPrice1mArray.length % 5 === 0) {
        let highPrice1m = highPrice1mArray.slice(0, 5);
        let highPrice1mMax = Math.max(...highPrice1m);
        highPrice5mArray.unshift(highPrice1mMax);
      }

      if (lowPrice1mArray.length % 5 === 0) {
        let lowPrice1m = lowPrice1mArray.slice(0, 5);
        let lowPrice1mLow = Math.min(...lowPrice1m);
        lowPrice5mArray.unshift(lowPrice1mLow);
      }

      if (closePrice1mArray.length % 5 === 0) {
        let closePrice5m = closePrice1mArray[0]; // So the difference between volume5m and volume5mArray is that volume5m stores one integer for 5m and then it is pushed into actual volume5mArray which is array that holds all 5m data
        closePrice5mArray.unshift(closePrice5m);
      }

      // 15 MINUTES

      if (openPrice1mArray.length % 15 === 0) {
        let openPrice15m = openPrice1mArray[14]; // So the difference between volume5m and volume5mArray is that volume5m stores one integer for 5m and then it is pushed into actual volume5mArray which is array that holds all 5m data
        openPrice15mArray.unshift(openPrice15m);
      }

      if (highPrice1mArray.length % 15 === 0) {
        let highPrice15m = highPrice1mArray.slice(0, 15);
        let highPrice15mMax = Math.max(...highPrice15m);
        highPrice15mArray.unshift(highPrice15mMax);
      }

      if (lowPrice1mArray.length % 15 === 0) {
        let lowPrice15m = lowPrice1mArray.slice(0, 15);
        let lowPrice15mLow = Math.min(...lowPrice15m);
        lowPrice15mArray.unshift(lowPrice15mLow);
      }

      if (closePrice1mArray.length % 15 === 0) {
        let closePrice15m = closePrice1mArray[14]; // So the difference between volume5m and volume5mArray is that volume5m stores one integer for 5m and then it is pushed into actual volume5mArray which is array that holds all 5m data
        closePrice15mArray.unshift(closePrice15m);
      }

      // 1 HOUR

      if (openPrice1mArray.length % 60 === 0) {
        let openPrice1hr = openPrice1mArray[59]; // So the difference between volume5m and volume5mArray is that volume5m stores one integer for 5m and then it is pushed into actual volume5mArray which is array that holds all 5m data
        openPrice1hrArray.unshift(openPrice1hr);
      }

      if (highPrice1mArray.length % 60 === 0) {
        let highPrice1hr = highPrice1mArray.slice(0, 60);
        let highPrice1hrMax = Math.max(...highPrice1hr);
        highPrice1hrArray.unshift(highPrice1hrMax);
      }

      if (lowPrice1mArray.length % 60 === 0) {
        let lowPrice1hr = lowPrice1mArray.slice(0, 60);
        let lowPrice1hrLow = Math.min(...lowPrice1hr);
        lowPrice1hrArray.unshift(lowPrice1hrLow);
      }

      if (closePrice1mArray.length % 60 === 0) {
        let closePrice1hr = closePrice1mArray[0]; // So the difference between volume5m and volume5mArray is that volume5m stores one integer for 5m and then it is pushed into actual volume5mArray which is array that holds all 5m data
        closePrice1hrArray.unshift(closePrice1hr);
      }

      // 4 HOURS

      if (openPrice1mArray.length % 240 === 0) {
        let openPrice4hr = openPrice1mArray[239]; // So the difference between volume5m and volume5mArray is that volume5m stores one integer for 5m and then it is pushed into actual volume5mArray which is array that holds all 5m data
        openPrice4hrArray.unshift(openPrice4hr);
      }

      if (highPrice1mArray.length % 240 === 0) {
        let highPrice4hr = highPrice1mArray.slice(0, 240);
        let highPrice4hrMax = Math.max(...highPrice4hr);
        highPrice4hrArray.unshift(highPrice4hrMax);
      }

      if (lowPrice1mArray.length % 240 === 0) {
        let lowPrice4hr = lowPrice1mArray.slice(0, 240);
        let lowPrice4hrLow = Math.min(...lowPrice4hr);
        lowPrice4hrArray.unshift(lowPrice4hrLow);
      }

      if (closePrice1mArray.length % 240 === 0) {
        let closePrice4hr = closePrice1mArray[0]; // So the difference between volume5m and volume5mArray is that volume5m stores one integer for 5m and then it is pushed into actual volume5mArray which is array that holds all 5m data
        closePrice4hrArray.unshift(closePrice4hr);
      }

      usdPriceArray = [];
      priceOpenInteger = null;
      priceHighInteger = null;
      priceLow = null;
      priceClose = null;
      // console.log(usdPriceArray);
    }
  } catch (error) {
    console.log(error);
  } finally {
    setTimeout(fetcher, 200);
  }
}

// PLEASE NOTE THAT VOLUME CALCULATION HAS A MEASUREMENT ERROR FROM 20% to 40% !!! READ THE COMMENT BELOW
// MUST BE REMADE WITH BLOCK PARSER SOME TIME LATER(You can forget about this without private node)
async function getVolume() {
  // This volume getter is not precise because of how it gets the tx's amounts!
  // It only analyses tx post and pre token balances, subtracting one from another,
  // and if swap is in the middle of tx it will show that amounts are all zero!
  // I have no idea for now how to get it all good, probably with instruction analysis.
  // If you know how to, PLEASE contribute!

  try {
    if (slotChecker == true) {
      firstSlot = await connection.getSlot({
        commitment: "confirmed",
      });
      slotChecker = false;
      // console.log(firstSlot);
    } else {
      secondSlot = await connection.getSlot({
        commitment: "confirmed",
      });
      let signatures = await connection.getSignaturesForAddress(address);
      let signaturesList = signatures
        .filter(
          (item) =>
            item.slot >= firstSlot &&
            item.slot <= secondSlot &&
            item.err == null
        )
        .map((item) => item.signature);

      let transactions = await Promise.all(
        signaturesList.map((signature) =>
          connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0,
            // encoding: 'jsonParsed'
          })
        )
      );

      let signer = transactions.map((item) =>
        item.transaction.message.staticAccountKeys[0].toString()
      );

      let postBalances = transactions
        .map((item) => item.meta.postTokenBalances) //
        .flat()
        .filter((item) => item.mint == address && signer.includes(item.owner));
      let preBalances = transactions
        .map((item) => item.meta.preTokenBalances) //
        .flat()
        .filter((item) => item.mint == address && signer.includes(item.owner));

      let postBalancesTokenAmount = postBalances.map(
        (item) => item.uiTokenAmount.amount
      ); // If something of this doesn't show up It is ZERO
      let preBalancesTokenAmount = preBalances.map(
        (item) => item.uiTokenAmount.amount
      ); // If something of this doesn't show up It is ZERO

      let volumeToken = postBalancesTokenAmount.map((post, index) => {
        // Investigate further
        let preValue =
          preBalancesTokenAmount[index] !== undefined
            ? preBalancesTokenAmount[index]
            : 0;
        let postValue = post !== undefined ? post : 0;
        return postValue - preValue;
      });

      volumeToken = volumeToken.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
      let volumeTokenPositive = Math.abs(volumeToken);
      // figure out how to code more compact
      let decimalsMultiplier = "1" + "0".repeat(tokenDecimals);
      let decimalsMultiplierNumber = parseInt(decimalsMultiplier, 10);

      let responsePrice = await fetch(
        `https://api.jup.ag/price/v2?ids=${address}`
      );
      let data = await responsePrice.json();
      let dataPrice = await data.data[address].price;
      let volumeAmountDecimal =
        (volumeTokenPositive / decimalsMultiplierNumber) * dataPrice;
      let volumeAmount = Math.round(volumeAmountDecimal); // Probably will not be so precise. Needs testing with jest and actual volume
      // figure out how to code more compact


      volume1mArray.unshift(volumeAmount);

      if (volume1mArray.length % 5 === 0) {
        let volume5m = volume1mArray // So the difference between volume5m and volume5mArray is that volume5m stores one integer for 5m and then it is pushed into actual volume5mArray which is array that holds all 5m data
          .slice(0, 5)
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        volume5mArray.unshift(volume5m);
      }

      if (volume1mArray.length % 15 === 0) {
        let volume15m = volume1mArray
          .slice(0, 15)
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        volume15mArray.unshift(volume15m);
      }

      if (volume1mArray.length % 60 === 0) {
        let volume1hr = volume1mArray
          .slice(0, 60)
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        volume1hrArray.unshift(volume1hr);
      }

      if (volume1mArray.length % 240 === 0) {
        let volume4hr = volume1mArray
          .slice(0, 240)
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        volume4hrArray.unshift(volume4hr);
      }

      firstSlot = secondSlot;
      buyAmountdecimal = null;
      secondSlot = null;
    }
  } catch (error) {
    console.log(error);
  }
}

// REST API SECTION

expressApp
  .route("/ohlcv-creator/test-api/HARAMBE/time/1m")
  .get((req, res) => {
    res.set("Content-Type", "application/json");
    console.log("Request received for /test-api/HARAMBE/time/1m");
    res.send({
      ohlcv: {
        open: openPrice1mArray,
        high: highPrice1mArray,
        low: lowPrice1mArray,
        close: closePrice1mArray,
        volume: volume1mArray,
      },
    });
  })
  .post((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  })
  .put((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  })
  .delete((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  });

expressApp
  .route("/ohlcv-creator/test-api/HARAMBE/time/5m")
  .get((req, res) => {
    res.set("Content-Type", "application/json");
    console.log("Request received for /test-api/HARAMBE/time/5m");
    res.send({
      ohlcv: {
        open: openPrice5mArray,
        high: highPrice5mArray,
        low: lowPrice5mArray,
        close: closePrice5mArray,
        volume: volume5mArray,
      },
    });
  })
  .post((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  })
  .put((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  })
  .delete((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  });

expressApp
  .route("/ohlcv-creator/test-api/HARAMBE/time/15m")
  .get((req, res) => {
    res.set("Content-Type", "application/json");
    console.log("Request received for /test-api/HARAMBE/time/15m");
    res.send({
      ohlcv: {
        open: openPrice15mArray,
        high: highPrice15mArray,
        low: lowPrice15mArray,
        close: closePrice15mArray,
        volume: volume15mArray,
      },
    });
  })
  .post((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  })
  .put((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  })
  .delete((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  });

expressApp
  .route("/ohlcv-creator/test-api/HARAMBE/time/1hr")
  .get((req, res) => {
    res.set("Content-Type", "application/json");
    console.log("Request received for /test-api/HARAMBE/time/1hr");
    res.send({
      ohlcv: {
        open: openPrice1hrArray,
        high: highPrice1hrArray,
        low: lowPrice1hrArray,
        close: closePrice1hrArray,
        volume: volume1hrArray,
      },
    });
  })
  .post((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  })
  .put((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  })
  .delete((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  });

expressApp
  .route("/ohlcv-creator/test-api/HARAMBE/time/4hr")
  .get((req, res) => {
    res.set("Content-Type", "application/json");
    console.log("Request received for /test-api/HARAMBE/time/4hr");
    res.send({
      ohlcv: {
        open: openPrice4hrArray,
        high: highPrice4hrArray,
        low: lowPrice4hrArray,
        close: closePrice4hrArray,
        volume: volume4hrArray,
      },
    });
  })
  .post((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  })
  .put((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  })
  .delete((req, res) => {
    res.set("Allow", "GET");
    res.status(405).send({ error: "Method Not Allowed" });
  });

async function serverStart() {
  try {
    await connector();
    console.log("Connected.");

    expressApp.listen(port, () => {
      console.log(`OHLCV API listening on port ${port}`);
    });
    await UTCExecutor();
  } catch (error) {
    console.error("Error encountered during startup: ", error);
    process.exit(1);
  }
}

serverStart();

module.exports = expressApp;
