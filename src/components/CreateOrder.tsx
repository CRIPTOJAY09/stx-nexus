import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Bitcoin, DollarSign, Wallet } from 'lucide-react';
import { validateBTCAddress, calculateDiscount, calculatePlatformFee } from '../utils/validation';
import type { Order } from '../types/Order';

export default function CreateOrder() {
  const [btcAmount, setBtcAmount] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBTCPrice = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const data = await response.json();
        setCurrentPrice(parseFloat(data.price));
      } catch (error) {
        toast.error('Failed to fetch BTC price');
      }
    };

    fetchBTCPrice();
    const interval = setInterval(fetchBTCPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateBTCAddress(walletAddress)) {
      toast.error('Invalid BTC wallet address');
      setIsLoading(false);
      return;
    }

    const btcAmountNum = parseFloat(btcAmount);
    if (isNaN(btcAmountNum) || btcAmountNum <= 0) {
      toast.error('Invalid BTC amount');
      setIsLoading(false);
      return;
    }

    const discountedAmount = calculateDiscount(btcAmountNum);
    const totalUsdt = discountedAmount * currentPrice;
    const platformFee = calculatePlatformFee(totalUsdt);

    const newOrder: Order = {
      btcAmount: btcAmountNum,
      walletAddress,
      currentPrice,
      discountedAmount,
      totalUsdt,
      platformFee,
      timestamp: Date.now(),
    };

    setOrder(newOrder);
    toast.success('Order created successfully!');
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              BTC Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Bitcoin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.00000001"
                value={btcAmount}
                onChange={(e) => setBtcAmount(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00000000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your BTC Wallet Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Wallet className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your BTC wallet address"
                required
              />
            </div>
          </div>

          {currentPrice > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600">
                Current BTC Price: <span className="font-semibold">${currentPrice.toLocaleString()}</span>
              </p>
              {btcAmount && !isNaN(parseFloat(btcAmount)) && (
                <>
                  <p className="text-sm text-gray-600">
                    Discounted BTC (6% off): <span className="font-semibold">{calculateDiscount(parseFloat(btcAmount))} BTC</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Total USDT: <span className="font-semibold">${(calculateDiscount(parseFloat(btcAmount)) * currentPrice).toLocaleString()}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Platform Fee (3%): <span className="font-semibold">${(calculatePlatformFee(calculateDiscount(parseFloat(btcAmount)) * currentPrice)).toLocaleString()}</span>
                  </p>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>
      </form>

      {order && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              BTC Amount: <span className="font-semibold">{order.btcAmount} BTC</span>
            </p>
            <p className="text-sm text-gray-600">
              Wallet Address: <span className="font-semibold">{order.walletAddress}</span>
            </p>
            <p className="text-sm text-gray-600">
              Price at Order: <span className="font-semibold">${order.currentPrice.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-600">
              Discounted Amount: <span className="font-semibold">{order.discountedAmount} BTC</span>
            </p>
            <p className="text-sm text-gray-600">
              Total USDT: <span className="font-semibold">${order.totalUsdt.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-600">
              Platform Fee: <span className="font-semibold">${order.platformFee.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-600">
              Created: <span className="font-semibold">{new Date(order.timestamp).toLocaleString()}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}