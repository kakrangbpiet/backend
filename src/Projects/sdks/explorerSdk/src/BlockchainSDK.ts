/* eslint-disable @typescript-eslint/no-explicit-any */

import { ethers, Transaction } from 'ethers';

import { NetworkStats } from '../DataTypes/interfaces';

// import { calculateAverageBlockTime, calculateTotalTransactions, getGasUsedToday, getTransactionsToday } from './Helpers/BlockchainHelper.js';


type ProviderType = 'ethers';



// interface Block {

//     number: number;

//     timestamp: number;

//     transactions: string[];

//     [key: string]: any;

// }


// interface Transaction {

//     hash: string;

//     from: string;

//     to: string;

//     value: string;

//     gas: number;

//     [key: string]: any;

// }


// interface AddressDetails {

//     balance: string;

//     transactions: Transaction[];

// }


class BlockchainSDK {

    private provider: ethers.JsonRpcProvider;

    private type: ProviderType;

    constructor(rpcUrl: string, providerType: ProviderType = 'ethers') {

        this.type = providerType;

        this.provider = new ethers.JsonRpcProvider(rpcUrl);

    }


    // Fetch block by number or 'latest'

    async getBlock(blockNumber:string | number | "latest" ): Promise<any | null> {

        try {

            const block = await (this.provider as ethers.JsonRpcProvider).getBlock(blockNumber as number);
            
            return block;

        } catch (error) {

            console.error(`Error fetching block: ${error}`);

            return null;

        }

    }


    async getBlockGasUsed(blockNumber: number | 'latest'): Promise<any | null> {

        try {

            const block = await (this.provider as ethers.JsonRpcProvider).getBlock(blockNumber as number);

            return block?.gasUsed;

        } catch (error) {

            console.error(`Error fetching block gas Used: ${error}`);

            return null;

        }

    }


    async getBlockMiner(blockNumber:string | number): Promise<any | null> {

        try {

            const block = await (this.provider as ethers.JsonRpcProvider).getBlock(blockNumber as number);

            return block?.miner;

        } catch (error) {

            console.error(`Error fetching block miner: ${error}`);

            return null;

        }

    }


    async getBlockWithTransactions(blockNumber:string | number): Promise<any | null> {

        try {

            let blockPayload: Array<any> = []; // Array to aggregate all transactions of a single block.
            const block = await (this.provider as ethers.JsonRpcProvider).getBlock(blockNumber as number,true);
            if (block) {
                blockPayload = block.prefetchedTransactions;
            }
            return  {
                transactions: blockPayload
            }

        } catch (error) {

            console.error(`Error fetching block with trxs: ${error}`);

            return null;

        }

    }

    // Fetch transaction by hash

    async getTransaction(txHash: string): Promise<any | null> {

        try {

            const transaction = await (this.provider as ethers.JsonRpcProvider).getTransaction(txHash);

            return transaction;

        } catch (error) {

            console.error(`Error fetching transaction: ${error}`);

            return null;

        }

    }

    // Send a Blockchain private transaction

    async sendPrivateTransaction(

        from: string,

        to: string,

        value: string,

        gas: number,

        // privateOptions: BlockchainPrivacyOptions

    ): Promise<any | null | any> {

        try {


            throw new Error('Private transactions are not implemented with this SDK');

        } catch (error) {

            throw new Error(`Failed to send private transaction: ${error}`);

        }

    }

    // Fetch balance and transactions of an address

    async getAddressDetails(address: string): Promise<any | null> {

        try {
            const code = await this.provider.getCode(address);
            const isContract = code && code !== '0x';
    
            let balance: bigint = BigInt(0);

            balance = await (this.provider as ethers.JsonRpcProvider).getBalance(address);

            return {addressType: isContract ? 'Contract' : 'Wallet',
                balance };

        } catch (error) {

            console.error(`Error fetching address details: ${error}`);

            return null;

        }

    }

    async getAddressTypeAndTransactions(address: string, blockCount: number = 1) {
        try {
            const code = await this.provider.getCode(address);
            const isContract = code && code !== '0x';

            const transactions: Transaction[] =  await this.getTransactionsByAddress(address)
    
            return {
                addressType: isContract ? 'Contract' : 'Wallet',
                transactions,
            };
        } catch (error) {
            console.error(`Error fetching address type and transactions: ${error}`);
            return null;
        }
    }
    
    // Helper to get address transactions
    private async getTransactionsByAddress(address: string, blockCount: number = 5): Promise<Transaction[]> {

        const transactions: Transaction[] = [];
        // Start from the latest block
        const currentBlockNumber: number = await (this.provider as ethers.JsonRpcProvider).getBlockNumber();

        for (let i = 0; i < blockCount; i++) {

            const block = await this.getBlock(currentBlockNumber - i);

            if (block && block.transactions) {

                // Iterate over each transaction in the block

                for (const txHash of block.transactions) {

                    const tx = await this.getTransaction(txHash as string);

                    // Check if the transaction involves the specified address

                    if (tx && (tx.from === address || tx.to === address)) {

                        transactions.push(tx);

                    }

                }

            }

        }


        return transactions;

    }

    async getNetworkStats(): Promise<NetworkStats | null> {

        try {

            // const blockNumber = await this.provider.getBlockNumber();

            const feeData = await this.provider.getFeeData();

            const gasPrice = feeData.gasPrice;

            const staticGasPrice = gasPrice ? ethers.formatUnits(gasPrice, 'gwei') : '0';


            // Calculate dynamic stats using helper functions

            // const totalTransactions = await calculateTotalTransactions(this.provider, blockNumber - 10000, blockNumber); // Last 10000 blocks

            const totalTransactions = 100

            // const averageBlockTime = await calculateAverageBlockTime(this.provider, blockNumber - 100, blockNumber); // Last 100 blocks

            const averageBlockTime = 100

            // const gasUsedToday = await getGasUsedToday(this.provider);

            const gasUsedToday = 1000;

            // const transactionsToday = await getTransactionsToday(this.provider);

            const transactionsToday = parseFloat( (Math.random() * 10 + 0.1).toFixed(2)) * 700

            // const blocksToday = Math.floor(24 * 60 * 60 / averageBlockTime); // Estimated blocks for 24 hours

            const blocksToday = 100 // Estimated blocks for 24 hours


            const networkUtilizationPercentage = parseFloat((parseInt(gasUsedToday.toString()) / totalTransactions * 100).toFixed(2));


            const gasPrices = {

                average: parseFloat(staticGasPrice),

                fast: parseFloat(staticGasPrice) * 1.2,

                slow: parseFloat(staticGasPrice) * 0.8,

            };


            return {

                totalBlocks: blocksToday,

                totalAddresses: 1000000,

                totalTransactions,

                averageBlockTime,

                totalGasUsed: gasUsedToday.toString(),

                transactionsToday,

                gasUsedToday: gasUsedToday.toString(),

                gasPrices,

                staticGasPrice,

                networkUtilizationPercentage,

            };

        } catch (error) {

            console.error(`Error fetching network stats: ${error}`);

            return null;

        }

    }

    async loadBlocksInTimeFrame(startBlock: number, blocksPerPage: number): Promise<any[]> {

        const endBlock = startBlock - blocksPerPage + 1;

        const blocks: any[] = [];
        const batchPromises: Promise<any>[] = [];


        for (let i = startBlock; i >= endBlock; i -= 5) {
            const batchPromises: Promise<any>[] = [];

            for (let j = 0; j < 5 && (i - j) >= endBlock; j++) {

                batchPromises.push(this.getBlock(i - j));

            }

            const batchResults = await Promise.all(batchPromises);

            for (const block of batchResults.filter(block => block !== null)) {

                blocks.push(block);

            }

        }

        return blocks;

    }

    async getBlockTransactionCount(blockHashOrBlockNumber:string |  number | 'latest'): Promise<number | null> {

        try {

            const block = await (this.provider as ethers.JsonRpcProvider).getBlock(blockHashOrBlockNumber as number);

            if (block) {

                return block.transactions.length;

            } else {

                return null;

            }

        } catch (error) {

            console.error(`Error fetching block wuth trxCount: ${error}`);

            return null;

        }

    }

}


export default BlockchainSDK;