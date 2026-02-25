import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function HistoryTable() {
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
  fetchShipments();

  const channel = supabase
    .channel("history-shipments")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "shipments",
      },
      () => {
        console.log("History auto refresh triggered");
        fetchShipments();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  const fetchShipments = async () => {
    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch error:", error);
    } else {
      setShipments(data);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("shipments")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchShipments();
    } else {
      console.log("Delete error:", error);
    }
  };

  const updateStatus = async (id, currentStatus) => {
    let newStatus = "";

    if (currentStatus === "pending") {
      newStatus = "In Transit";
    } else if (currentStatus === "in transit") {
      newStatus = "Delivered";
    } else {
      return;
    }

    const { error } = await supabase
      .from("shipments")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      fetchShipments();
    }
  };

  return (
    <div className="history">
      <h2>📦 Shipment History</h2>

      {/* 🔎 Search Bar */}
      <input
        type="text"
        placeholder="Search by Tracking ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <table>
        <thead>
          <tr>
            <th>Tracking ID</th>
            <th>Distance</th>
            <th>Weight</th>
            <th>Transport</th>
            <th>Status</th>
            <th>Expected Delivery</th>
            <th>Final Price</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {shipments
            .filter((item) =>
              item.tracking_id
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
            .map((item) => {
              const today = new Date();
              const expected = item.expected_delivery
                ? new Date(item.expected_delivery)
                : null;

              const isOverdue =
                expected &&
                today > expected &&
                item.status?.toLowerCase() !== "delivered";

              return (
                <tr key={item.id}>
                  <td>{item.tracking_id}</td>
                  <td>{item.distance} km</td>
                  <td>{item.weight} kg</td>
                  <td>{item.transport}</td>

                  {/* Status + Overdue */}
                  <td>
                    <span
                      className={`status ${item.status
                        ?.toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {item.status}
                    </span>

                    {isOverdue && (
                      <span className="overdue">
                        Overdue
                      </span>
                    )}
                  </td>

                  {/* Expected Delivery */}
                  <td>
                    {item.expected_delivery
                      ? new Date(
                          item.expected_delivery
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>₹{item.final_price}</td>

                  <td className="action-buttons">
                    {item.status?.toLowerCase() !==
                      "delivered" && (
                      <button
                        onClick={() =>
                          updateStatus(
                            item.id,
                            item.status?.toLowerCase()
                          )
                        }
                        className="update-btn"
                      >
                        Next Stage
                      </button>
                    )}

                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(item.id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryTable;