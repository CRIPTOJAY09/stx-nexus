export interface Order {
  btcAmount: number;
  walletAddress: string;
  currentPrice: number;
  discountedAmount: number;
  totalUsdt: number;
  platformFee: number;
  timestamp: number;
}