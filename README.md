[![](https://dcbadge.limes.pink/api/server/ySvyXEFZAK)](https://discord.gg/ySvyXEFZAK)
![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/solcrateslabs)
[![Telegram Badge](https://img.shields.io/badge/Telegram-blue?style=flat-square&logo=telegram&logoColor=FFFFFF&labelColor=48cae0&color=48cae0)](https://t.me/solcrateslabs)
[![Email Badge](https://img.shields.io/badge/Contact-magenta?style=flat-square&logo=Gmail&logoColor=FFFFFF&labelColor=992580&color=FF00FF)](mailto:contact@solcrateslabs.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


# OHLCV Creator

### OHLCV Creator is a powerful API selfhosted tool, that allows <br> gathering individual specified OHLCV(Open High Low Close Volume) <br> Data for all traders across all Solana on-chain memetokens. <br> Intended to use with Free RPC tiers from Solana providers

### Advantages of OHLCV Creator

+ 📖 Complete Open-Source, with easily modified code  

+ 🤖 Perfect in use with trading software

+ 🌞 Uses Solana Web3 SDK and high-end Jupiter Price API to get live data

+ 👨‍🔧 Always maintained and updated
  
+ 💎 Works wonderful with free Solana RPC tiers(like Free or Freemium)

## How to start using OHLCV Creator?
**You can try our testing API available at endpoint:**

<https://solcrateslabs.tech/ohlcv-creator/test-api/HARAMBE/time/1m> <br> 
**Possible time parameters: `1m`, `5m`, `15m`, `1hr` and `4hr`**

### 🦍 provides HARAMBE token data


## If you want to set everything for yourself and selfhost OHLCV creator:

**git clone the project** 

```git clone https://github.com/Solcrates-Labs/ohlcvcreator.git```

**Install dependencies using npm**

```npm install```

**Launch the project using node**

```node ./src/index.js``` or just ```node .```

**.env file will be created with RPC_URL and PORT variables. <br> Fill them up and launch OHLCV creator again.**

**NOTE: PORT MUST BE PORT FORWARDED IF YOU WANT TO USE PROGRAM OUTSIDE OF LOCALHOST**

## Everything is set up. After launching, the program will start getting info at certain time

**To ensure the EXPRESS.JS functions are working correctly visit URL ```127.0.0.1:YOURPORT/ohlcv-creator/test-api/HARAMBE/time/1m``` after launching the application again**
