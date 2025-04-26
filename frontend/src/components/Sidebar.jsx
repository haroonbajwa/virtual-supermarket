import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ 
  layoutName, 
  setLayoutName, 
  handleSaveLayout, 
  handleBackToDashboard,
  isPlacingRegularAisle,
  handleAddAisle,
  handleRemoveAisle,
  selectedAisle,
  isLoading,
  pendingChanges
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isLoading ? 'loading' : ''}`}>
      <button 
        className="collapse-button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? '←' : '→'}
      </button>

      {!isCollapsed && (
        <div className="sidebar-content">
          {/* Layout Controls Section */}
          <div className="section">
            <h3>Layout Controls</h3>
            <div className="layout-controls">
              <input
                type="text"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="Enter layout name"
                className="layout-input"
                disabled={isLoading}
              />
              <button
                onClick={handleSaveLayout}
                className={`save-button ${pendingChanges ? 'pending' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Save Layout'}
                {pendingChanges && <span className="pending-dot" title="You have unsaved changes"></span>}
              </button>
              <button
                onClick={handleBackToDashboard}
                className="back-button"
                disabled={isLoading}
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Layout Designer Section */}
          <div className="section">
            <h3>Layout Designer</h3>
            <div className="designer-controls">
              <button
                onClick={handleAddAisle}
                className={`add-button ${isPlacingRegularAisle ? 'active' : ''}`}
                disabled={isLoading}
              >
                Add Aisle
              </button>
              <button
                onClick={handleRemoveAisle}
                className={`remove-button ${selectedAisle !== null ? 'enabled' : 'disabled'}`}
                disabled={selectedAisle === null || isLoading}
              >
                Remove Aisle
              </button>
            </div>
            <div className="designer-info">
              <div className="info-item">
                <div className="info-dot"></div>
                <span>Click aisle to select/deselect</span>
              </div>
              <div className="info-item">
                <div className="info-dot"></div>
                <span>Use B+/B- to adjust product boxes</span>
              </div>
              <div className="info-item">
                <div className="info-dot"></div>
                <span>Drag to rotate, scroll to zoom</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
