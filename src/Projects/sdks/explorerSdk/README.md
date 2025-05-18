# Blockchain SDK


Blockchain SDK is a Node.js SDK for interacting with blockchain networks using ethers.js. It provides a simple API for retrieving blocks, transactions, network statistics, and sending private transactions. This SDK is designed to work with customizable provider URLs, enabling flexible interactions with various blockchain nodes.


## Installation


Install the package using npm:


`npm install skaya-explorer`


## Usage

### Importing the SDK


To use the SDK, import it into your project:


```typescript

import meta_explorer from 'skaya-explorer';

const { BlockchainSDK } = meta_explorer;

```


### Initializing the SDK


Initialize the SDK with a provider URL and specify the provider type (e.g., 'ethers'):


```typescript

const blockchainSDK = new BlockchainSDK(providerUrl, 'ethers');

```


### API


The SDK provides several methods to interact with the blockchain network.

### Methods


#### getBlock(blockNumber: string | number)


Retrieves a block by its number or the string 'latest'.


```typescript

const block = await blockchainSDK.getBlock('latest');

```


#### getTransaction(txHash: string)


Fetches transaction details by its hash.


```typescript

const transaction = await blockchainSDK.getTransaction('0xTransactionHash');

```


#### sendPrivateTransaction(from: string, to: string, value: string, gas: string, options: object)


Sends a private transaction to a specified address with optional privacy options.


```typescript

const receipt = await blockchainSDK.sendPrivateTransaction(from, to, value, gas, { privateFor, privacyFlag });

```


#### getAddressDetails(address: string)


Fetches balance and transaction details for a specific address.


```typescript

const details = await blockchainSDK.getAddressDetails('0xAddress');

```


#### getNetworkStats()


Retrieves network statistics, such as the current block number and other metrics.


```typescript

const networkStats = await blockchainSDK.getNetworkStats();

```


#### getBlockGasUsed(blockNumber: number | 'latest')


Fetches the gas used in a specific block.


```typescript

const gasUsed = await blockchainSDK.getBlockGasUsed('latest');

```


#### getBlockMiner(blockNumber: string | number)


Fetches the miner of a specific block.


```typescript

const miner = await blockchainSDK.getBlockMiner('latest');

```


#### getBlockWithTransactions(blockNumber: string | number)


Fetches a block along with its transactions.


```typescript

const blockWithTransactions = await blockchainSDK.getBlockWithTransactions('latest');

```


#### loadBlocksInTimeFrame(startBlock: number, blocksPerPage: number)


Loads blocks within a specified timeframe.


```typescript

const blocks = await blockchainSDK.loadBlocksInTimeFrame(1000000, 100);

```


#### getBlockTransactionCount(blockHashOrBlockNumber: string | number | 'latest')


Fetches the transaction count of a specific block.


```typescript

const transactionCount = await blockchainSDK.getBlockTransactionCount('latest');

```


## Example Usage


Here’s a basic example of using the SDK to retrieve the latest block, fetch transactions within a block, and send a private transaction:


```typescript

import BlockchainSDK from 'skaya-explorer';


const providerUrl = 'https://your.provider.url';

const blockchainSDK = new BlockchainSDK(providerUrl, 'ethers');


async function main() {

    // Retrieve the latest block

    const latestBlock = await blockchainSDK.getBlock('latest');

    console.log('Latest Block:', latestBlock);


    // Fetch a transaction by its hash

    const txHash = '0xTransactionHash';

    const transaction = await blockchainSDK.getTransaction(txHash);

    console.log('Transaction:', transaction);

}


main().catch(console.error);

```


## Error Handling


The SDK throws custom errors defined in the BlockchainError enum. Handle these errors using try-catch blocks:


```typescript

try {

    const block = await blockchainSDK.getBlock('latest');

} catch (error) {

    console.error('Error retrieving block:', error);

}

```


## License

