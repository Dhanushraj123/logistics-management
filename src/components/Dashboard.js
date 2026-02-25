import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const [shipments, setShipments] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [onTimePercent, setOnTimePercent] = useState(0);
  const [showMonthlyStats, setShowMonthlyStats] = useState(false);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("realtime-shipments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipments",
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("shipments")
      .select("*");

    if (!error && data) {
      setShipments(data);

      let revenue = 0;
      let profit = 0;
      let delivered = 0;
      let overdue = 0;
      let onTime = 0;

      const today = new Date();

      data.forEach((item) => {
        revenue += Number(item.final_price || 0);
        profit += Number(item.final_price || 0) * 0.2;

        if (item.status?.toLowerCase() === "delivered") {
          delivered++;

          if (item.expected_delivery) {
            const expected = new Date(item.expected_delivery);
            if (expected >= today) {
              onTime++;
            }
          }
        }

        if (
          item.expected_delivery &&
          new Date(item.expected_delivery) < today &&
          item.status?.toLowerCase() !== "delivered"
        ) {
          overdue++;
        }
      });

      setTotalRevenue(revenue);
      setTotalProfit(profit);
      setDeliveredCount(delivered);
      setOverdueCount(overdue);

      const performance =
        delivered > 0
          ? ((onTime / delivered) * 100).toFixed(1)
          : 0;

      setOnTimePercent(performance);
    }
  };

  // 📊 Revenue by Transport
  const transportTypes = ["road", "air", "sea"];

  const revenueByTransport = transportTypes.map((type) =>
    shipments
      .filter((s) => s.transport === type)
      .reduce((sum, s) => sum + Number(s.final_price || 0), 0)
  );

  const barChartData = {
    labels: ["Road", "Air", "Sea"],
    datasets: [
      {
        label: "Revenue by Transport",
        data: revenueByTransport,
        backgroundColor: [
          "rgba(37, 99, 235, 0.6)",
          "rgba(16, 185, 129, 0.6)",
          "rgba(234, 179, 8, 0.6)",
        ],
      },
    ],
  };

  // 📈 Monthly Revenue Trend
  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const monthlyRevenue = {};

  monthNames.forEach((month) => {
    monthlyRevenue[month] = 0;
  });

  shipments.forEach((item) => {
    if (item.created_at) {
      const date = new Date(item.created_at);
      const monthIndex = date.getMonth();
      const month = monthNames[monthIndex];
      monthlyRevenue[month] += Number(item.final_price || 0);
    }
  });

  const monthlyChartData = {
    labels: monthNames,
    datasets: [
      {
        label: "Monthly Revenue",
        data: monthNames.map((month) => monthlyRevenue[month]),
        borderColor: "rgba(37, 99, 235, 1)",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="dashboard">
      <h2>📊 Dashboard Summary</h2>

      <div className="stats">
        <div className="stat-card">
          <h3>Total Shipments</h3>
          <p>{shipments.length}</p>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>₹{totalRevenue.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <h3>Total Profit</h3>
          <p>₹{totalProfit.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <h3>Delivered</h3>
          <p>{deliveredCount}</p>
        </div>

        <div className="stat-card">
          <h3>Overdue</h3>
          <p>{overdueCount}</p>
        </div>

        <div className="stat-card">
          <h3>On-Time %</h3>
          <p>{onTimePercent}%</p>
        </div>
      </div>

      <div className="chart">
        <h3>📊 Revenue by Transport</h3>
        <Bar data={barChartData} />
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setShowMonthlyStats(!showMonthlyStats)}
          className="toggle-btn"
        >
          {showMonthlyStats ? "Hide Monthly Stats" : "📅 View Monthly Stats"}
        </button>
      </div>

      {showMonthlyStats && (
        <div className="chart">
          <h3>📈 Monthly Revenue Trend</h3>
          <Line data={monthlyChartData} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;