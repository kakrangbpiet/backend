import { WebSocketServer } from 'ws';
import { serializeBigInt } from './SerializeBigInt.js';
import BlockchainSDK from '../../Projects/sdks/explorerSdk/src/BlockchainSDK.js';

// Use a variable to hold the instance of the BlockchainSDK
let blockchainSDK: BlockchainSDK | null = null;

// Initialize the Blockchain SDK with provider URL from the request
const initializeBlockchainSDK = (providerUrl: string, providerType: 'ethers') => {
    blockchainSDK = new BlockchainSDK(providerUrl, providerType);
};

export function setupWebSocketServer(server, path = '/ws') {
    const wss = new WebSocketServer({ server ,path});

    console.log(`WebSocket server is running on port ${server}`);

    wss.on('connection', (ws) => {
        console.log('Client connected');

        ws.on('message', (message) => {
            const data = JSON.parse(message.toString());
            
            if (data.type === 'INIT' && data.rpcUrl) {
                initializeBlockchainSDK(data?.rpcUrl, 'ethers');
                // Start sending new blocks
                sendNewBlocks(ws);
            }
            if (data.type === 'STATS_INIT' && data.rpcUrl) {
                initializeBlockchainSDK(data?.rpcUrl, 'ethers');
                sendStats(ws);
            }
            if (data.type === 'DAILY_TRX_INIT' && data.rpcUrl) {
                initializeBlockchainSDK(data?.rpcUrl, 'ethers');
                sendDailyTrx(ws);
            }
        });

        ws.send(JSON.stringify({ message: 'Connected to WebSocket' }));
    });
}

async function sendNewBlocks(ws) {
    let lastBlockNumber = await blockchainSDK?.getBlock('latest').then(block => block?.number);

    const interval = setInterval(async () => {
        try {
            const latestBlock = await blockchainSDK?.getBlock('latest');
            if (latestBlock?.number > lastBlockNumber) {
                lastBlockNumber = latestBlock?.number;
                // console.log(latestBlock);
                
                // Fetch the transaction count for the latest block
                const transactionsCount = await blockchainSDK?.getBlockTransactionCount(latestBlock?.number);
                
                // Create a new object that includes the block data and transaction count
                const blockWithTrxCount = {
                    ...latestBlock,
                    transactionsCount, // Add the transaction count to the block data
                };

                // Serialize the block data (including BigInt properties)
                const serializedBlock = serializeBigInt(blockWithTrxCount);

                // Send the serialized block data to the client
                ws.send(JSON.stringify(serializedBlock));
            }
        } catch (error) {
            console.error('Error fetching latest block or transaction count:', error);
        }
    }, 100); // Check every minisecond

    // Cleanup on WebSocket close
    ws.on('close', () => {
        clearInterval(interval);
        console.log('WebSocket connection closed');
    });
}

async function sendStats(ws) {
    const interval = setInterval(async() => {
        try {
            const networkStats = await blockchainSDK?.getNetworkStats();
            
            const statsUpdate = {
                type: 'STATS_UPDATE',
                stats: networkStats,
            };
            
            ws.send(JSON.stringify(statsUpdate));
        } catch (error) {
            console.error('Error sending stats update:', error);
        }
    }, 7000); // Send updates every 7 seconds

    ws.on('close', () => {
        clearInterval(interval);
        console.log('WebSocket connection closed');
    });
}
async function sendDailyTrx(ws) {
    const sendAllDailyTrxData = () => {
        const oneYearMockData = generateMockDailyTrxData();
console.log(oneYearMockData);

        const dailyTrxData = {
            type: 'DAILY_TRX_UPDATE',
            data: oneYearMockData,  // Send all days at once
        };

        ws.send(JSON.stringify(dailyTrxData));
        console.log('Sent full year daily trx data');
    };

    // Immediately send all data upon connection
    sendAllDailyTrxData();

    // Set up interval to repeat every 12 hours (12 * 60 * 60 * 1000 ms)
    const interval = setInterval(() => {
        sendAllDailyTrxData();
    }, 12 * 60 * 60 * 1000);  // 12 hours in milliseconds

    ws.on('close', () => {
        clearInterval(interval);
        console.log('WebSocket connection closed');
    });
}


function generateMockDailyTrxData(): { date: string; transactionsCount: number }[] {
    const mockData: { date: string; transactionsCount: number }[] = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // Go back 1 year from today

    for (let i = 0; i < 365; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        mockData.push({
            date: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
            transactionsCount: Math.floor(Math.random() * 1000) + 100, // Random trx count between 100 and 1100
        });
    }

    return mockData;
}