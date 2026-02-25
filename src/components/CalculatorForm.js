import React, { useState } from "react";
import { supabase } from "../supabaseClient";

function CalculatorForm({ onCalculate }) {

  const generateTrackingId = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TRK-${new Date().getFullYear()}-${random}`;
  };

  const [distance, setDistance] = useState("");
  const [weight, setWeight] = useState("");
  const [transport, setTransport] = useState("road");

  const handleSubmit = async (e) => {
    e.preventDefault();

    onCalculate(distance, weight, transport);

    const costPerKm = 10;
    const multiplier = { road: 1, air: 3, sea: 1.5 };

    const baseCost = distance * costPerKm;
    const weightCharge = weight * 2;
    const subtotal = (baseCost + weightCharge) * multiplier[transport];
    const gst = subtotal * 0.18;
    const finalPrice = subtotal + gst;

    const trackingId = generateTrackingId();

    // ✅ Expected Delivery Calculation (inside submit)
    const today = new Date();
    let deliveryDays = 0;

    if (transport === "road") deliveryDays = 3;
    if (transport === "air") deliveryDays = 1;
    if (transport === "sea") deliveryDays = 7;

    const expectedDate = new Date();
    expectedDate.setDate(today.getDate() + deliveryDays);

    const formattedDate = expectedDate.toISOString().split("T")[0];

    const { data, error } = await supabase.from("shipments").insert([
      {
        distance: Number(distance),
        weight: Number(weight),
        transport,
        final_price: finalPrice,
        tracking_id: trackingId,
        status: "Pending",
        expected_delivery: formattedDate,
      },
    ]);

        console.log("Inserted:", data);
        console.log("Error:", error);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Distance (km)"
        value={distance}
        onChange={(e) => setDistance(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        required
      />

      <select
        value={transport}
        onChange={(e) => setTransport(e.target.value)}
      >
        <option value="road">Road</option>
        <option value="air">Air</option>
        <option value="sea">Sea</option>
      </select>

      <button type="submit">Calculate</button>
    </form>
  );
}

export default CalculatorForm;