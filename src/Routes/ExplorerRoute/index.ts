import * as BlockchainController from '../../Controllers/Blockchain/ExplorerController.js';
import express from "express";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /block/{blockNumber}:
 *   post:
 *     summary: Get block details by block number or 'latest'
 *     tags:
 *       - Explorer
 *     parameters:
 *       - in: path
 *         name: blockNumber
 *         required: true
 *         schema:
 *           type: string
 *           example: "latest"
 *       - in: body
 *         name: rpcUrl
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             rpcUrl:
 *               type: string
 *               example: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
 *     responses:
 *       200:
 *         description: Block details retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.post('/block/:blockNumber', BlockchainController.getBlock);

/**
 * @swagger
 * /getBlockWithTrx/{blockNumber}:
 *   post:
 *     summary: Get block details with transactions
 *     tags:
 *       - Explorer
 *     parameters:
 *       - in: path
 *         name: blockNumber
 *         required: true
 *         schema:
 *           type: string
 *           example: "latest"
 *       - in: body
 *         name: rpcUrl
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             rpcUrl:
 *               type: string
 *               example: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
 *     responses:
 *       200:
 *         description: Block details with transactions retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.post('/getBlockWithTrx/:blockNumber', BlockchainController.getBlockWithTrx);

/**
 * @swagger
 * /transaction/{txHash}:
 *   post:
 *     summary: Get transaction details by hash
 *     tags:
 *       - Explorer
 *     parameters:
 *       - in: path
 *         name: txHash
 *         required: true
 *         schema:
 *           type: string
 *           example: "0x123456789abcdef"
 *       - in: body
 *         name: rpcUrl
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             rpcUrl:
 *               type: string
 *               example: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.post('/transaction/:txHash', BlockchainController.getTransaction);

/**
 * @swagger
 * /transaction/private:
 *   post:
 *     summary: Send a private transaction
 *     tags:
 *       - Explorer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rpcUrl:
 *                 type: string
 *               from:
 *                 type: string
 *               to:
 *                 type: string
 *               value:
 *                 type: string
 *               gas:
 *                 type: number
 *               privateFor:
 *                 type: array
 *                 items:
 *                   type: string
 *               privacyFlag:
 *                 type: number
 *             example:
 *               rpcUrl: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
 *               from: "0x123456789abcdef"
 *               to: "0xabcdef123456789"
 *               value: "1000000000000000000"
 *               gas: 21000
 *               privateFor: ["Qm123...", "Qm456..."]
 *               privacyFlag: 3
 *     responses:
 *       200:
 *         description: Private transaction sent successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/transaction/private', BlockchainController.sendPrivateTransaction);

/**
 * @swagger
 * /address/{address}:
 *   post:
 *     summary: Get address details including balance and transactions
 *     tags:
 *       - Explorer
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *           example: "0xabcdef123456789"
 *       - in: body
 *         name: rpcUrl
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             rpcUrl:
 *               type: string
 *               example: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
 *     responses:
 *       200:
 *         description: Address details retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.post('/address/:address', BlockchainController.getAddressDetails);

/**
 * @swagger
 * /blocks/previous/{numberOfBlocks}:
 *   post:
 *     summary: Get previous blocks
 *     tags:
 *       - Explorer
 *     parameters:
 *       - in: path
 *         name: numberOfBlocks
 *         required: true
 *         schema:
 *           type: number
 *           example: 5
 *       - in: body
 *         name: rpcUrl
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             rpcUrl:
 *               type: string
 *               example: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
 *     responses:
 *       200:
 *         description: Previous blocks retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.post('/blocks/previous/:numberOfBlocks', BlockchainController.getPreviousBlocks);

/**
 * @swagger
 * /block/transactionCount/{blockNumber}:
 *   post:
 *     summary: Get transaction count in a block
 *     tags:
 *       - Explorer
 *     parameters:
 *       - in: path
 *         name: blockNumber
 *         required: true
 *         schema:
 *           type: string
 *           example: "latest"
 *       - in: body
 *         name: rpcUrl
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             rpcUrl:
 *               type: string
 *               example: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
 *     responses:
 *       200:
 *         description: Transaction count retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.post('/block/getTransactionCountInBlock/:blockNumber', BlockchainController.getTransactionCountInBlock);

/**
 * @swagger
 * /block/allTransactions/{requiredTransactions}:
 *   post:
 *     summary: Get all previous transactions by pagination
 *     tags:
 *       - Explorer
 *     parameters:
 *       - in: path
 *         name: requiredTransactions
 *         required: false
 *         schema:
 *           type: number
 *           example: 10
 *       - in: body
 *         name: rpcUrl
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             rpcUrl:
 *               type: string
 *               example: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.post('/block/allTransactions/:requiredTransactions', BlockchainController.getAllTransactionsInPreviousBlocks);

/**
 * @swagger
 * /stats:
 *   post:
 *     summary: Get network statistics
 *     tags:
 *       - Explorer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rpcUrl:
 *                 type: string
 *                 example: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
 *     responses:
 *       200:
 *         description: Network statistics retrieved successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/stats', BlockchainController.getNetworkStats);

/**
 * @swagger
 * /blocksInFrame:
 *   post:
 *     summary: Get blocks within a specified time frame
 *     tags:
 *       - Explorer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rpcUrl:
 *                 type: string
 *               startBlock:
 *                 type: number
 *               blocksPerPage:
 *                 type: number
 *             example:
 *               rpcUrl: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
 *               startBlock: 1000000
 *               blocksPerPage: 10
 *     responses:
 *       200:
 *         description: Blocks retrieved successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/blocksInFrame', BlockchainController.getBlocksInTimeFrame);

export default router;