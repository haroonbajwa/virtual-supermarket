import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLayouts } from "../services/api.service";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
        setError("Failed to load layouts. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    console.log("test call");
    fetchLayouts();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="owner-dashboard">
      <header className="dashboard-header">
        <h1>Store Owner Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        <section className="layouts-section">
          <h2>My Store Layouts</h2>

          {layouts.length === 0 ? (
            <div className="no-layouts">
              <p>You do not have any layouts assigned to you yet.</p>
              <p>
                Please contact an administrator to get a layout assigned to your
                store.
              </p>
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
                    onClick={() => navigate(`/builder/${layout._id}`)}
                    className="view-layout-btn"
                  >
                    View Store Layout
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

export default OwnerDashboard;
