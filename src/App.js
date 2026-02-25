import React, { useState } from "react";
import CalculatorForm from "./components/CalculatorForm";
import ResultCard from "./components/ResultCard";
import HistoryTable from "./components/HistoryTable";
import Dashboard from "./components/Dashboard";
import "./styles.css";

function App() {
  const [result, setResult] = useState(null);

  const calculateCost = (distance, weight, transport) => {
    const costPerKm = 10;

    const multiplier = {
      road: 1,
      air: 3,
      sea: 1.5,
    };

    const baseCost = distance * costPerKm;
    const weightCharge = weight * 2;
    const subtotal = (baseCost + weightCharge) * multiplier[transport];
    const gst = subtotal * 0.18;
    const profit = subtotal * 0.2;
    const finalPrice = subtotal + gst;

    setResult({
      baseCost,
      weightCharge,
      subtotal,
      gst,
      profit,
      finalPrice,
    });
  };

  return (
  <div className="app">
    {/* Sidebar */}
   <div className="sidebar">
  <h2>🚛 LogiTrack</h2>
  <ul>
    <li onClick={() => document.getElementById("dashboard").scrollIntoView({ behavior: "smooth" })}>
      Dashboard
    </li>

    <li onClick={() => document.getElementById("calculator").scrollIntoView({ behavior: "smooth" })}>
      Calculator
    </li>

    <li onClick={() => document.getElementById("shipments").scrollIntoView({ behavior: "smooth" })}>
      Shipments
    </li>
  </ul>
</div>

    {/* Main Content */}
    <div className="content">
  <h1>Logistics Management Dashboard</h1>

  <div id="dashboard">
    <Dashboard />
  </div>

  <div id="calculator" className="main">
    <CalculatorForm onCalculate={calculateCost} />
    <ResultCard result={result} />
  </div>

  <div id="shipments">
    <HistoryTable />
  </div>
  </div>
</div>
);
}

export default App;
