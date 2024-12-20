import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [wallet, setWallet] = useState<string>("");
  const [network, setNetwork] = useState<string>("");
  const [orders, setOrders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [orderNumber, setOrderNumber] = useState<number>(109); // Comienza en STX109

  useEffect(() => {
    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchBtcPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
      );
      setBtcPrice(parseFloat(response.data.price));
    } catch (error) {
      console.error("Error fetching BTC price:", error);
    }
  };

  const handleCreateOrder = () => {
    const discount = btcPrice * 0.06;
    const priceAfterDiscount = btcPrice - discount;
    const platformFee = priceAfterDiscount * 0.03;
    const totalToTransfer = priceAfterDiscount + platformFee;

    const newOrder = {
      id: `STX${orderNumber}`, // Genera ID consecutivo
      discount: discount.toFixed(2),
      priceAfterDiscount: priceAfterDiscount.toFixed(2),
      platformFee: platformFee.toFixed(2),
      totalToTransfer: totalToTransfer.toFixed(2),
      wallet,
      network,
      timer: 7200, // 120 minutos en segundos
      createdAt: new Date().toLocaleString(), // Fecha y hora de creación
    };

    setOrders([...orders, newOrder]);
    setOrderNumber(orderNumber + 1); // Incrementa el número de orden
    setWallet("");
    setNetwork("");
  };

  const handlePaymentReceived = (id: string) => {
    const completedOrder = orders.find((order) => order.id === id);
    if (completedOrder) {
      completedOrder.status = "Completed";
      setHistory([...history, completedOrder]);
      setOrders(orders.filter((order) => order.id !== id));
    }
  };

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.timer > 0 ? { ...order, timer: order.timer - 1 } : { ...order, timer: 0 }
        )
      );
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`app-container ${isDarkMode ? "dark" : ""}`}>
      <h1 className="title">STX Nexus</h1>
      <button className="mode-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="form-container">
        <h3>Create Order</h3>
        <p><strong>BTC Price:</strong> ${btcPrice.toFixed(2)}</p>
        <label>BTC Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <label>Wallet Address:</label>
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />
        <label>Network:</label>
        <input
          type="text"
          placeholder="Example: BEP20, TRC20"
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
        />
        <p><strong>Send funds to:</strong></p>
        <p><strong>BEP20:</strong> 0xBdaB0e3B02072660B570896C0771F3e707d09893</p>
        <p><strong>TRC20:</strong> TS3o9rFnykg8AbnnWsiHmqcDeerC9wDfbw</p>
        <button className="create-button" onClick={handleCreateOrder}>
          Create Order
        </button>
        <a
          href="https://wa.me/+34624841306"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-button"
        >
          Contact Support
        </a>
      </div>

      <div className="orders-container">
        <h3>Active Orders</h3>
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <p><strong>ID:</strong> {order.id}</p>
            <p><strong>Discount (6%):</strong> ${order.discount}</p>
            <p><strong>Platform Fees (3%):</strong> ${order.platformFee}</p>
            <p><strong>Total to Transfer:</strong> ${order.totalToTransfer}</p>
            <p><strong>Created At:</strong> {order.createdAt}</p>
            <p><strong>Time Left:</strong> {formatTime(order.timer)}</p>
            <button
              className="payment-button"
              onClick={() => handlePaymentReceived(order.id)}
            >
              Payment Received
            </button>
          </div>
        ))}
      </div>

      <div className="history-container">
        <h3>Transaction History</h3>
        {history.map((item) => (
          <div key={item.id} className="order-card">
            <p><strong>ID:</strong> {item.id}</p>
            <p><strong>Total Transferred:</strong> ${item.totalToTransfer}</p>
            <p><strong>Platform Fees:</strong> ${item.platformFee}</p>
            <p><strong>Status:</strong> {item.status}</p>
            <p><strong>Created At:</strong> {item.createdAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
