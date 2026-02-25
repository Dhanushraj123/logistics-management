import React from "react";

function ResultCard({ result }) {
  if (!result) return <div className="card">No calculation yet.</div>;

  return (
    <div className="card">
      <h3>📊 Result</h3>
      <p>Base Cost: ₹{result.baseCost.toFixed(2)}</p>
      <p>Weight Charge: ₹{result.weightCharge.toFixed(2)}</p>
      <p>Subtotal: ₹{result.subtotal.toFixed(2)}</p>
      <p className="gst">GST (18%): ₹{result.gst.toFixed(2)}</p>
      <p className="profit">Profit (20%): ₹{result.profit.toFixed(2)}</p>
      <h2 className="final">Final Price: ₹{result.finalPrice.toFixed(2)}</h2>
    </div>
  );
}

export default ResultCard;