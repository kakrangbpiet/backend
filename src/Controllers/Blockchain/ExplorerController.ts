// src/Controllers/BlockchainController.ts
import { Request, Response, NextFunction } from 'express';
import { serializeBigInt } from '../../Utils/scripts/SerializeBigInt.js';
import { BlockchainError } from '../../DataTypes/enums/Error.js';
import { Block, ethers } from 'ethers';
import BlockchainSDK from '../../Projects/sdks/explorerSdk/src/BlockchainSDK.js';

// Use a variable to hold the instance of the BlockchainSDK
let blockchainSDK: BlockchainSDK | null = null;

// Initialize the Blockchain SDK with rpc Url from the request
const initializeBlockchainSDK = (rpcUrl: string, providerType: 'ethers') => {
    blockchainSDK = new BlockchainSDK(rpcUrl, providerType);
};

// Get block by number or 'latest'
export const getBlock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rpcUrl } = req.body; // Get rpc Url from request body

        if (!rpcUrl) {
            throw BlockchainError.MissingrpcUrl();
        }

        initializeBlockchainSDK(rpcUrl, 'ethers'); // You can set it to 'ethers' if needed

        const blockNumber = req.params.blockNumber === 'latest' ? 'latest' : parseInt(req.params.blockNumber);
        const block = await blockchainSDK?.getBlock(blockNumber);
        if (block) {
            // Serialize BigInt properties
            const serializedBlock = serializeBigInt(block);
            res.status(200).json(serializedBlock);
        } else {
            res.status(404).json({ error: 'Block not found' });
        }
    } catch (error) {
        next(error);
    }
};
export const getBlockWithTrx = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rpcUrl } = req.body; // Get rpc Url from request body

        if (!rpcUrl) {
            throw BlockchainError.MissingrpcUrl();
        }

        initializeBlockchainSDK(rpcUrl, 'ethers'); // You can set it to 'ethers' if needed

        const blockNumber = req.params.blockNumber === 'latest' ? 'latest' : parseInt(req.params.blockNumber);
        const block = await blockchainSDK?.getBlockWithTransactions(blockNumber);
        if (block) {
            // Serialize BigInt properties
            const serializedBlock = serializeBigInt(block);
            res.status(200).json(serializedBlock.transactions);
        } else {
            res.status(404).json({ error: 'Block trx not found' });
        }
    } catch (error) {
        next(error);
    }
};

export const getPreviousBlocks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rpcUrl } = req.body;
        const { numberOfBlocks } = req.params; // Number of previous blocks to retrieve

        if (!rpcUrl) {
            throw BlockchainError.MissingrpcUrl();
        }

        initializeBlockchainSDK(rpcUrl, 'ethers');

        const latestBlock = await blockchainSDK?.getBlock('latest');
        if (!latestBlock) {
            return res.status(404).json({ error: 'Latest block not found' });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blocks: any[] = [];
        let currentBlockNumber = latestBlock.number;

        for (let i = 0; i < parseInt(numberOfBlocks); i++) {
            const block = await blockchainSDK?.getBlock(currentBlockNumber);
            const transactionCount = await blockchainSDK?.getBlockTransactionCount(block.number);
            if (block) {
                const blockWithTransactionCount = {
                    ...block,
                    transactionsCount: transactionCount, // Default to 0 if transaction count is undefined
                };
                blocks.push(serializeBigInt(blockWithTransactionCount));
                currentBlockNumber--; // Move to the previous block
            } else {
                break; // Stop if the block is not found
            }
        }

        res.status(200).json(blocks);
    } catch (error) {
        next(error);
    }
};

// Get transactions Count  in a specific block
export const getTransactionCountInBlock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rpcUrl } = req.body;
        const { blockNumber } = req.params;

        if (!rpcUrl) {
            throw BlockchainError.MissingrpcUrl();
        }

        initializeBlockchainSDK(rpcUrl, 'ethers');

        const transactionCount = await blockchainSDK?.getBlockTransactionCount(parseInt(blockNumber));

        if (transactionCount === undefined) {
            return res.status(404).json({ error: 'Block not found' });
        }

        res.status(200).json({ blockNumber, transactionCount });
    } catch (error) {
        next(error);
    }
};

// Get all transactions in a specific block
// ! This function is not used in the current implementation due to slow response time  
// export const getTransactionsInBlock = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { rpcUrl } = req.body; 
//         const blockNumberParam = req.params.blockNumber; // Block number to retrieve transactions from

//         if (!rpcUrl) {
//             throw BlockchainError.MissingrpcUrl();
//         }

//         initializeBlockchainSDK(rpcUrl, 'ethers');

//         // Determine if the block number is 'latest' or a number
//         const blockNumber = blockNumberParam === 'latest' ? 'latest' : parseInt(blockNumberParam);

//         const block = await blockchainSDK?.getBlock(blockNumber);
//         if (block && block.transactions) {
//             const transactions = await Promise.all(
//                 block.transactions.map(async (txHash: string) => {
//                     const transaction = await blockchainSDK?.getTransaction(txHash);
//                     return serializeBigInt(transaction);
//                 })
//             );

//             res.status(200).json(transactions);
//         } else {
//             res.status(404).json({ error: 'Block not found or no transactions' });
//         }
//     } catch (error) {
//         next(error);
//     }
// };

// Get previous blocks with a specified number of transactions
export const getAllTransactionsInPreviousBlocks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rpcUrl } = req.body; // Get rpc Url from request body
        const { requiredTransactions = "10" } = req.params; // Number of transactions required

        if (!rpcUrl) {
            throw BlockchainError.MissingrpcUrl();
        }

        initializeBlockchainSDK(rpcUrl, 'ethers');

        const latestBlock = await blockchainSDK?.getBlock('latest');
        if (!latestBlock) {
            return res.status(404).json({ error: 'Latest block not found' });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transactions: any[] = []; // Array to hold the collected transactions
        let currentBlockNumber = latestBlock.number;

        // Keep fetching blocks until we reach the required number of transactions
        while (transactions.length < parseInt(requiredTransactions)) {
            const block = await blockchainSDK?.getBlock(currentBlockNumber);
            if (!block) {
                break; // Stop if the block is not found
            }

            // If the block has transactions, retrieve them
            if (block.transactions) {
                for (const txHash of block.transactions) {
                    const transaction = await blockchainSDK?.getTransaction(txHash);
                    if (transaction) {
                        transactions.push(serializeBigInt(transaction));
                        // Stop if we have reached the required number of transactions
                        if (transactions.length >= parseInt(requiredTransactions)) {
                            break;
                        }
                    }
                }
            }

            currentBlockNumber--; // Move to the previous block
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.log(error);

        next(error);
    }
};

// Get transaction by hash
export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rpcUrl } = req.body; // Get rpc Url from request body

        if (!rpcUrl) {
            throw BlockchainError.MissingrpcUrl();
        }

        initializeBlockchainSDK(rpcUrl, 'ethers');

        const transaction = await blockchainSDK?.getTransaction(req.params.txHash);
        const serializedTrx = serializeBigInt(transaction);
        if (transaction) {
            res.status(200).json(serializedTrx);
        } else {
            res.status(404).json({ error: 'Transaction not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Send a private transaction
export const sendPrivateTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rpcUrl, from, to, value, gas, privateFor, privacyFlag } = req.body; // Get from request body

        if (!rpcUrl) {
            throw BlockchainError.MissingrpcUrl();
        }
        initializeBlockchainSDK(rpcUrl, 'ethers');

        // todo: remove eslint after using privateOptions
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const privateOptions = { privateFor, privacyFlag };
        const receipt = await blockchainSDK?.sendPrivateTransaction(from, to, value, gas /*, privateOptions*/);
        if (receipt) {
            res.status(201).json(receipt);
        } else {
            res.status(400).json({ error: 'Failed to send private transaction' });
        }
    } catch (error) {
        next(error);
    }
};

// Get address details (balance and transactions)
export const getAddressDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rpcUrl } = req.body; // Get rpc Url from request body

        if (!rpcUrl) {
            throw BlockchainError.MissingrpcUrl();
        }
        initializeBlockchainSDK(rpcUrl, 'ethers');

        const address = req.params.address;
        const details = await blockchainSDK?.getAddressDetails(address);
        if (details) {
            // Convert BigInt properties to number
            const convertedDetails = {
                ...details,
                balance: details.balance ? ethers.formatUnits(details.balance.toString(), 18) : '0',
            };

            res.status(200).json(convertedDetails);
        } else {
            res.status(404).json({ error: 'Address not found or no transactions' });
        }
    } catch (error) {
        next(error);
    }
};



// Get Network Statistics
export const getNetworkStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rpcUrl } = req.body;

        if (!rpcUrl) {
            throw BlockchainError.MissingrpcUrl();
        }

        initializeBlockchainSDK(rpcUrl, 'ethers');

        const networkStats = await blockchainSDK?.getNetworkStats();
        if (networkStats) {
            res.status(200).json(networkStats);
        } else {
            res.status(404).json({ error: 'Failed to retrieve network statistics' });
        }
    } catch (error) {
        next(error);
    }
};

export const getBlocksInTimeFrame = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rpcUrl } = req.body;
        const { startBlock, blocksPerPage,transactionRequired } = req.body;
        if (!rpcUrl) {
            throw BlockchainError.MissingrpcUrl();
        }
        

        initializeBlockchainSDK(rpcUrl, 'ethers');
        let blocks

        if (startBlock=="latest" ) {
            await blockchainSDK?.getBlock("latest").then( async(res) => {
                blocks = await blockchainSDK?.loadBlocksInTimeFrame(parseInt(res.number),parseInt(blocksPerPage));
            });
        }
        else{
            blocks = await blockchainSDK?.loadBlocksInTimeFrame(parseInt(startBlock), parseInt(blocksPerPage));
        }
        
        if (blocks) {
            
            // Serialize BigInt properties
            const serializedBlocks = blocks.map(block => serializeBigInt(block));
            res.status(200).json(serializedBlocks);
        } else {
            res.status(404).json({ error: 'Blocks not found' });
        }


    } catch (error) {
        next(error);
    }
};