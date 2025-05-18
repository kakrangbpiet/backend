export interface NetworkStats {
    totalBlocks: number;
    totalAddresses: number;
    totalTransactions: number;
    averageBlockTime: number;
    totalGasUsed: string;
    transactionsToday: number;
    gasUsedToday: string;
    gasPrices: {
        average: number;
        fast: number;
        slow: number;
    };
    staticGasPrice: string;
    networkUtilizationPercentage: number;
}