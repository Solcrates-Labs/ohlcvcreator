# OHLCV creator

### OHLCV Creator is a powerful API selfhosted tool for gathering specified OHLCV(Open High Low Close Volume) Data across all Solana on-chain memetokens.

*🦾Why you should use OHLCV Creator:*

#### 📖Complete Open-Source, with easily modified code

#### 🤖Perfect in use with trading software

#### 🌞Uses Solana Web3 SDK and high-end Jupiter Price API to get live data

#### 👨‍🔧Always maintained and updated

### How to start using OHLCV Creator?
**You can try our testing API available at endpoint:**
https://solcrateslabs.tech/ohlcv-creator/test-api/HARAMBE/time/1m

Possible time parameters: 1m, 5m, 15m, 1hr, 4hr
**🦍 provides HARAMBE token data**

#### If you want to set everything for yourself and selfhost OHLCV creator:

**git clone the project** 

```git clone https://github.com/Solcrates-Labs/ohlcvcreator.git```

**Install dependencies using npm**

```npm install```

**Launch the project using node**

```node ./src/index.js``` or just ```node .```

**.env file will be created with RPC_URL and PORT variables. Fill them up and launch OHLCV creator again. NOTE: PORT MUST BE PORT FORWARDED IF YOU WANT TO USE PROGRAM OUTSIDE OF LOCALHOST**

#### Everything is set up. After launching, the program will start getting info at certain time

**To ensure the EXPRESS.JS functions are working correctly visit URL ```127.0.0.1:YOURPORT/ohlcv-creator/test-api/HARAMBE/time/1m``` after launching the application again**


