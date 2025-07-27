import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLayouts } from "../services/api.service";

const StoreView = () => {
  const navigate = useNavigate();
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        setLoading(true);
        const response = await getLayouts();
        setLayouts(response.data);
      } catch (err) {
        setError("Failed to load store layouts. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLayouts();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="store-view">
      <header className="view-header">
        <h1>Virtual Supermarket</h1>
        <div className="nav-links">
          <a href="/" className="home-link">Home</a>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="view-content">
        <section className="layouts-section">
          <h2>Available Store Layouts</h2>

          {layouts.length === 0 ? (
            <div className="no-layouts">
              <p>No store layouts are currently available.</p>
              <p>Please check back later.</p>
            </div>
          ) : (
            <div className="layouts-grid">
              {layouts.map((layout) => (
                <div key={layout._id} className="layout-card">
                  <h3>{layout.name}</h3>
                  <div className="layout-info">
                    <p>Aisles: {layout.aisles?.length || 0}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/view/${layout._id}`)}
                    className="view-layout-btn"
                  >
                    Browse Store
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StoreView;
