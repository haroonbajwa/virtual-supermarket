import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Box,
  Html
} from '@react-three/drei';
import Aisle from './Aisle';
import { layoutService } from '../services/layout.service';

// Realistic color palette
const colors = {
  background: '#F5F5F5',
  floor: '#E0E0E0',
  walls: '#BDBDBD',
  accent: [
    '#616161',   // Dark Gray
    '#424242',   // Darker Gray
    '#212121',   // Almost Black
  ]
};

const Store = () => {
  const [aisles, setAisles] = useState([
    {
      id: 0,
      position: [0, 0, 0],
      aisleDegree: 360,
      racks: Array.from({ length: 3 }, (_, index) => ({
        id: `A0-R${index + 1}`,
        position: [index * 3, 0, 0],
        rackType: 'd-rack', // Default rack type
        sides: {
          left: {
            id: `A0-R${index + 1}-L`,
            shelvesCount: 4,
            slotsPerShelf: [3, 3, 3, 3],
            shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
              id: `A0-R${index + 1}-L-SH${shelfIndex + 1}`,
              slots: Array.from({ length: 3 }, (_, slotIndex) => {
                const slotId = `A0-R${index + 1}-L-SH${shelfIndex + 1}-S${slotIndex + 1}`;
                return {
                  id: slotId,
                  productId: `P${Math.floor(Math.random() * 1000)}`,
                  productName: `Product ${Math.floor(Math.random() * 100)}`,
                  description: `Description for product in slot ${slotId}`,
                  price: (Math.random() * 100).toFixed(2),
                  quantity: Math.floor(Math.random() * 50)
                };
              })
            }))
          },
          right: {
            id: `A0-R${index + 1}-R`,
            shelvesCount: 4,
            slotsPerShelf: [3, 3, 3, 3],
            shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
              id: `A0-R${index + 1}-R-SH${shelfIndex + 1}`,
              slots: Array.from({ length: 3 }, (_, slotIndex) => {
                const slotId = `A0-R${index + 1}-R-SH${shelfIndex + 1}-S${slotIndex + 1}`;
                return {
                  id: slotId,
                  productId: `P${Math.floor(Math.random() * 1000)}`,
                  productName: `Product ${Math.floor(Math.random() * 100)}`,
                  description: `Description for product in slot ${slotId}`,
                  price: (Math.random() * 100).toFixed(2),
                  quantity: Math.floor(Math.random() * 50)
                };
              })
            }))
          }
        },
        size: { width: 2, depth: 1, height: 3 },
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      }))
    },
    {
      id: 1,
      position: [0, 0, 5],
      aisleDegree: 360,
      racks: Array.from({ length: 3 }, (_, index) => ({
        id: `A1-R${index + 1}`,
        position: [index * 3, 0, 0],
        rackType: 'd-rack', // Default rack type
        sides: {
          left: {
            id: `A1-R${index + 1}-L`,
            shelvesCount: 4,
            slotsPerShelf: [3, 3, 3, 3],
            shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
              id: `A1-R${index + 1}-L-SH${shelfIndex + 1}`,
              slots: Array.from({ length: 3 }, (_, slotIndex) => {
                const slotId = `A1-R${index + 1}-L-SH${shelfIndex + 1}-S${slotIndex + 1}`;
                return {
                  id: slotId,
                  productId: `P${Math.floor(Math.random() * 1000)}`,
                  productName: `Product ${Math.floor(Math.random() * 100)}`,
                  description: `Description for product in slot ${slotId}`,
                  price: (Math.random() * 100).toFixed(2),
                  quantity: Math.floor(Math.random() * 50)
                };
              })
            }))
          },
          right: {
            id: `A1-R${index + 1}-R`,
            shelvesCount: 4,
            slotsPerShelf: [3, 3, 3, 3],
            shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
              id: `A1-R${index + 1}-R-SH${shelfIndex + 1}`,
              slots: Array.from({ length: 3 }, (_, slotIndex) => {
                const slotId = `A1-R${index + 1}-R-SH${shelfIndex + 1}-S${slotIndex + 1}`;
                return {
                  id: slotId,
                  productId: `P${Math.floor(Math.random() * 1000)}`,
                  productName: `Product ${Math.floor(Math.random() * 100)}`,
                  description: `Description for product in slot ${slotId}`,
                  price: (Math.random() * 100).toFixed(2),
                  quantity: Math.floor(Math.random() * 50)
                };
              })
            }))
          }
        },
        size: { width: 2, depth: 1, height: 3 },
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      }))
    }
  ]);
  const [selectedAisle, setSelectedAisle] = useState(null);
  const [isPlacingRegularAisle, setIsPlacingRegularAisle] = useState(false);
  const [layouts, setLayouts] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [layoutName, setLayoutName] = useState('');

  console.log(aisles, "aisles state")

  // Fetch all layouts on component mount
  useEffect(() => {
    loadLayouts();
  }, []);

  const loadLayouts = async () => {
    try {
      const fetchedLayouts = await layoutService.getAllLayouts();
      setLayouts(fetchedLayouts);
    } catch (error) {
      console.error('Error loading layouts:', error);
    }
  };

  const handleSaveLayout = async () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name');
      return;
    }

    try {
      const layoutData = {
        name: layoutName,
        aisles: aisles
      };

      if (selectedLayout) {
        // Update existing layout
        await layoutService.updateLayout(selectedLayout._id, layoutData);
      } else {
        // Save new layout
        await layoutService.saveLayout(layoutData);
      }

      // Refresh layouts list
      await loadLayouts();
      setLayoutName('');
      setSelectedLayout(null);
      alert('Layout saved successfully!');
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Error saving layout. Please try again.');
    }
  };

  const handleLoadLayout = async (layout) => {
    if (selectedLayout) {
      setSelectedLayout(null)
    }
    else {
      try {
        const loadedLayout = await layoutService.getLayout(layout._id);
        setAisles(loadedLayout.aisles);
        setSelectedLayout(layout);
        setLayoutName(layout.name);
      } catch (error) {
        console.error('Error loading layout:', error);
        alert('Error loading layout. Please try again.');
      }
    }
  };

  const handleDeleteLayout = async (layout) => {
    if (!window.confirm('Are you sure you want to delete this layout?')) {
      return;
    }

    try {
      await layoutService.deleteLayout(layout._id);
      await loadLayouts();
      if (selectedLayout?._id === layout._id) {
        setSelectedLayout(null);
        setLayoutName('');
      }
      alert('Layout deleted successfully!');
    } catch (error) {
      console.error('Error deleting layout:', error);
      alert('Error deleting layout. Please try again.');
    }
  };

  const addAisle = (point) => {
    setAisles(prevAisles => [
      ...prevAisles,
      {
        id: prevAisles.length,
        position: [point.x, 0, point.z],
        aisleDegree: 360,
        racks: Array.from({ length: 3 }, (_, index) => ({
          id: `A${prevAisles.length}-R${index + 1}`,
          position: [index * 3, 0, 0],
          rackType: 'd-rack', // Default rack type
          sides: {
            left: {
              id: `A${prevAisles.length}-R${index + 1}-L`,
              shelvesCount: 4,
              slotsPerShelf: [3, 3, 3, 3],
              shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
                id: `A${prevAisles.length}-R${index + 1}-L-SH${shelfIndex + 1}`,
                slots: Array.from({ length: 3 }, (_, slotIndex) => {
                  const slotId = `A${prevAisles.length}-R${index + 1}-L-SH${shelfIndex + 1}-S${slotIndex + 1}`;
                  return {
                    id: slotId,
                    productId: `P${Math.floor(Math.random() * 1000)}`,
                    productName: `Product ${Math.floor(Math.random() * 100)}`,
                    description: `Description for product in slot ${slotId}`,
                    price: (Math.random() * 100).toFixed(2),
                    quantity: Math.floor(Math.random() * 50)
                  };
                })
              }))
            },
            right: {
              id: `A${prevAisles.length}-R${index + 1}-R`,
              shelvesCount: 4,
              slotsPerShelf: [3, 3, 3, 3],
              shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
                id: `A${prevAisles.length}-R${index + 1}-R-SH${shelfIndex + 1}`,
                slots: Array.from({ length: 3 }, (_, slotIndex) => {
                  const slotId = `A${prevAisles.length}-R${index + 1}-R-SH${shelfIndex + 1}-S${slotIndex + 1}`;
                  return {
                    id: slotId,
                    productId: `P${Math.floor(Math.random() * 1000)}`,
                    productName: `Product ${Math.floor(Math.random() * 100)}`,
                    description: `Description for product in slot ${slotId}`,
                    price: (Math.random() * 100).toFixed(2),
                    quantity: Math.floor(Math.random() * 50)
                  };
                })
              }))
            }
          },
          size: { width: 2, depth: 1, height: 3 },
          color: `hsl(${Math.random() * 360}, 70%, 60%)`
        }))
      }
    ]);
    setIsPlacingRegularAisle(false);
  };

  const removeSelectedAisle = () => {
    if (selectedAisle !== null) {
      setAisles(prevAisles => prevAisles.filter(aisle => aisle.id !== selectedAisle));
      setSelectedAisle(null);
    }
  };

  const updateRackData = (aisleId, rackData) => {
    console.log('Updating rack data:', rackData);

    if (rackData.action === 'add' || rackData.action === 'delete') {
      // Handle rack addition or deletion
      setAisles(prevAisles =>
        prevAisles.map(aisle =>
          aisle.id === aisleId
            ? {
              ...aisle,
              racks: rackData.racks.map((rack, index) => ({
                id: `A${aisleId}-R${index + 1}`,
                position: [index * 3, 0, 0],
                rackType: rack.rackType || 'd-rack', // Preserve or set default rack type
                sides: {
                  left: {
                    ...rack.sides.left,
                    shelves: Array.from({ length: rack.sides.left.shelvesCount }, (_, shelfIndex) => ({
                      id: `A${aisleId}-R${index + 1}-L-SH${shelfIndex + 1}`,
                      slots: Array.from({ length: rack.sides.left.slotsPerShelf[shelfIndex] }, (_, slotIndex) => ({
                        id: `A${aisleId}-R${index + 1}-L-SH${shelfIndex + 1}-S${slotIndex + 1}`,
                        productId: `P${Math.floor(Math.random() * 1000)}`,
                        productName: `Product ${Math.floor(Math.random() * 100)}`,
                        description: `Description for product`,
                        price: (Math.random() * 100).toFixed(2),
                        quantity: Math.floor(Math.random() * 50)
                      }))
                    }))
                  },
                  right: {
                    ...rack.sides.right,
                    shelves: Array.from({ length: rack.sides.right.shelvesCount }, (_, shelfIndex) => ({
                      id: `A${aisleId}-R${index + 1}-R-SH${shelfIndex + 1}`,
                      slots: Array.from({ length: rack.sides.right.slotsPerShelf[shelfIndex] }, (_, slotIndex) => ({
                        id: `A${aisleId}-R${index + 1}-R-SH${shelfIndex + 1}-S${slotIndex + 1}`,
                        productId: `P${Math.floor(Math.random() * 1000)}`,
                        productName: `Product ${Math.floor(Math.random() * 100)}`,
                        description: `Description for product`,
                        price: (Math.random() * 100).toFixed(2),
                        quantity: Math.floor(Math.random() * 50)
                      }))
                    }))
                  }
                },
                size: { width: 2, depth: 1, height: 3 },
                color: rack.color || `hsl(${Math.random() * 360}, 70%, 60%)`
              }))
            }
            : aisle
        )
      );
    } else if (rackData.rackType) {
      // Handle rack type updates
      setAisles(prevAisles =>
        prevAisles.map(aisle =>
          aisle.id === aisleId
            ? {
              ...aisle,
              racks: aisle.racks.map(rack =>
                rack.id === rackData.id
                  ? {
                    ...rack,
                    rackType: rackData.rackType
                  }
                  : rack
              )
            }
            : aisle
        )
      );
    } else if (rackData.updatedSlot) {
      // Handle slot updates from SlotForm
      console.log('Updating slot in Store:', rackData.updatedSlot);

      setAisles(prevAisles => {
        const newAisles = prevAisles.map(aisle => {
          if (aisle.id === aisleId) {
            console.log('Found matching aisle:', aisle.id);
            return {
              ...aisle,
              racks: aisle.racks.map(rack => {
                if (rack.id === rackData.id) {
                  console.log('Found matching rack:', rack.id);
                  return {
                    ...rack,
                    sides: {
                      left: {
                        ...rack.sides.left,
                        shelves: rack.sides.left.shelves.map(shelf => ({
                          ...shelf,
                          slots: shelf.slots.map(slot => {
                            if (slot.id === rackData.updatedSlot.id) {
                              console.log('Updating slot:', slot.id, 'with:', rackData.updatedSlot);
                              return rackData.updatedSlot;
                            }
                            return slot;
                          })
                        }))
                      },
                      right: {
                        ...rack.sides.right,
                        shelves: rack.sides.right.shelves.map(shelf => ({
                          ...shelf,
                          slots: shelf.slots.map(slot => {
                            if (slot.id === rackData.updatedSlot.id) {
                              console.log('Updating slot:', slot.id, 'with:', rackData.updatedSlot);
                              return rackData.updatedSlot;
                            }
                            return slot;
                          })
                        }))
                      }
                    }
                  };
                }
                return rack;
              })
            };
          }
          return aisle;
        });

        console.log('Updated aisle structure:', newAisles);
        return newAisles;
      });
    } else if (rackData.rackDegree !== undefined) {
      // Handle rack degree updates
      console.log("Updating rack degree for id:", rackData.id);
      setAisles(prevAisles => {
        const newAisles = prevAisles.map(aisle => ({
          ...aisle,
          racks: aisle.racks.map(rack =>
            rack.id === rackData.id
              ? {
                ...rack,
                rackDegree: rackData.rackDegree
              }
              : rack
          )
        }));
        console.log("New aisles:", newAisles);
        return newAisles;
      });
    } else if (rackData.aisleDegree !== undefined) {
      // Handle aisle degree updates
      console.log("Updating aisle degree for id:", aisleId);
      setAisles(prevAisles => {
        const newAisles = prevAisles.map(aisle =>
          aisle.id === aisleId
            ? {
              ...aisle,
              aisleDegree: rackData.aisleDegree
            }
            : aisle
        );
        console.log("New aisles:", newAisles);
        return newAisles;
      });
    } else {
      // Handle other rack updates (shelf/slot structure changes)
      setAisles(prevAisles =>
        prevAisles.map(aisle =>
          aisle.id === aisleId
            ? {
              ...aisle,
              racks: aisle.racks.map(rack =>
                rack.id === rackData.id
                  ? {
                    ...rack,
                    sides: {
                      left: {
                        ...rackData.sides.left,
                        shelves: Array.from({ length: rackData.sides.left.shelvesCount }, (_, shelfIndex) => ({
                          id: `${rackData.id}-L-SH${shelfIndex + 1}`,
                          slots: Array.from({ length: rackData.sides.left.slotsPerShelf[shelfIndex] }, (_, slotIndex) => ({
                            id: `${rackData.id}-L-SH${shelfIndex + 1}-S${slotIndex + 1}`,
                            productId: `P${Math.floor(Math.random() * 1000)}`,
                            productName: `Product ${Math.floor(Math.random() * 100)}`,
                            description: `Description for product`,
                            price: (Math.random() * 100).toFixed(2),
                            quantity: Math.floor(Math.random() * 50)
                          }))
                        }))
                      },
                      right: {
                        ...rackData.sides.right,
                        shelves: Array.from({ length: rackData.sides.right.shelvesCount }, (_, shelfIndex) => ({
                          id: `${rackData.id}-R-SH${shelfIndex + 1}`,
                          slots: Array.from({ length: rackData.sides.right.slotsPerShelf[shelfIndex] }, (_, slotIndex) => ({
                            id: `${rackData.id}-R-SH${shelfIndex + 1}-S${slotIndex + 1}`,
                            productId: `P${Math.floor(Math.random() * 1000)}`,
                            productName: `Product ${Math.floor(Math.random() * 100)}`,
                            description: `Description for product`,
                            price: (Math.random() * 100).toFixed(2),
                            quantity: Math.floor(Math.random() * 50)
                          }))
                        }))
                      }
                    }
                  }
                  : rack
              )
            }
            : aisle
        )
      );
    }
  };

  console.log(aisles);

  const handlePlaneClick = (event) => {
    if (isPlacingRegularAisle) {
      const point = event.point;
      setAisles(prevAisles => [
        ...prevAisles,
        {
          id: prevAisles.length,
          position: [point.x, 0, point.z],
          aisleDegree: 360,
          racks: Array.from({ length: 3 }, (_, index) => ({
            id: `A${prevAisles.length}-R${index + 1}`,
            position: [index * 3, 0, 0],
            rackType: 'd-rack', // Default rack type
            sides: {
              left: {
                id: `A${prevAisles.length}-R${index + 1}-L`,
                shelvesCount: 4,
                slotsPerShelf: [3, 3, 3, 3],
                shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
                  id: `A${prevAisles.length}-R${index + 1}-L-SH${shelfIndex + 1}`,
                  slots: Array.from({ length: 3 }, (_, slotIndex) => {
                    const slotId = `A${prevAisles.length}-R${index + 1}-L-SH${shelfIndex + 1}-S${slotIndex + 1}`;
                    return {
                      id: slotId,
                      productId: `P${Math.floor(Math.random() * 1000)}`,
                      productName: `Product ${Math.floor(Math.random() * 100)}`,
                      description: `Description for product in slot ${slotId}`,
                      price: (Math.random() * 100).toFixed(2),
                      quantity: Math.floor(Math.random() * 50)
                    };
                  })
                }))
              },
              right: {
                id: `A${prevAisles.length}-R${index + 1}-R`,
                shelvesCount: 4,
                slotsPerShelf: [3, 3, 3, 3],
                shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
                  id: `A${prevAisles.length}-R${index + 1}-R-SH${shelfIndex + 1}`,
                  slots: Array.from({ length: 3 }, (_, slotIndex) => {
                    const slotId = `A${prevAisles.length}-R${index + 1}-R-SH${shelfIndex + 1}-S${slotIndex + 1}`;
                    return {
                      id: slotId,
                      productId: `P${Math.floor(Math.random() * 1000)}`,
                      productName: `Product ${Math.floor(Math.random() * 100)}`,
                      description: `Description for product in slot ${slotId}`,
                      price: (Math.random() * 100).toFixed(2),
                      quantity: Math.floor(Math.random() * 50)
                    };
                  })
                }))
              }
            },
            size: { width: 2, depth: 1, height: 3 },
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
          }))
        }
      ]);
      setIsPlacingRegularAisle(false);
    }
  };

  const handleAisleClick = (event, aisleId) => {
    event.stopPropagation();
    setSelectedAisle(aisleId);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: colors.background,
      fontFamily: 'Roboto, Arial, sans-serif'
    }}>
      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{
          margin: '0 0 15px 0',
          color: colors.accent[0],
          borderBottom: `2px solid ${colors.accent[1]}`,
          paddingBottom: '10px',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Superstore Layout Designer
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsPlacingRegularAisle(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: isPlacingRegularAisle ? '#4CAF50' : colors.accent[1],
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {isPlacingRegularAisle ? 'Click to Place Regular Aisle' : 'Add Regular Aisle'}
          </button>
          <button
            onClick={removeSelectedAisle}
            disabled={selectedAisle === null}
            style={{
              padding: '12px 24px',
              backgroundColor: selectedAisle !== null ? '#f44336' : '#9e9e9e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedAisle !== null ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              opacity: selectedAisle !== null ? 1 : 0.7
            }}
            onMouseOver={(e) => selectedAisle !== null && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => selectedAisle !== null && (e.target.style.transform = 'translateY(0)')}
          >
            Delete Selected Aisle
          </button>
        </div>
        <div style={{
          marginTop: '20px',
          fontSize: '14px',
          color: colors.accent[0],
          lineHeight: '1.6'
        }}>
          {isPlacingRegularAisle && (
            <div style={{
              color: '#4CAF50',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}>
              Click anywhere on the floor to place the aisle
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent[1] }}></div>
            Click aisle to select/deselect
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent[2] }}></div>
            Use B+/B- to adjust product boxes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent[0] }}></div>
            Drag to rotate, scroll to zoom
          </div>
        </div>
      </div>

      {/* Layout Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        color: 'white',
        width: '300px'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Layout Controls</h3>

        {/* Save Layout */}
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            placeholder="Enter layout name"
            style={{
              padding: '8px',
              marginRight: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              marginBottom: '10px'
            }}
          />
          <button
            onClick={handleSaveLayout}
            style={{
              padding: '8px 15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            {selectedLayout ? 'Update Layout' : 'Save Layout'}
          </button>
        </div>

        {/* Layouts List */}
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <h4 style={{ marginBottom: '10px' }}>Saved Layouts</h4>
          {layouts.map(layout => (
            <div
              key={layout._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px',
                padding: '8px',
                backgroundColor: selectedLayout?._id === layout._id ? '#2196F3' : '#333',
                borderRadius: '4px'
              }}
            >
              <span style={{ flex: 1 }}>{layout.name}</span>
              <button
                onClick={() => handleLoadLayout(layout)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  marginRight: '5px',
                  cursor: 'pointer'
                }}
              >
                Load
              </button>
              <button
                onClick={() => handleDeleteLayout(layout)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <Canvas
        camera={{ position: [15, 15, 15], fov: 50 }}
        style={{
          background: colors.background,
          width: '100%',
          height: '100%',
          cursor: (isPlacingRegularAisle) ? 'crosshair' : 'default'
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        <PerspectiveCamera makeDefault position={[15, 15, 15]} />
        <OrbitControls
          target={[5, 0, 5]}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
          dampingFactor={0.05}
          enabled={!isPlacingRegularAisle}
        />

        {/* Realistic Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.7}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight
          position={[-10, 10, -10]}
          intensity={0.3}
          distance={50}
        />

        {/* Environment */}
        <Environment preset="warehouse" background />

        {/* Floor with click handler */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.5, 0]}
          receiveShadow
          onClick={handlePlaneClick}
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial
            color={colors.floor}
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Walls */}
        <Box args={[100, 20, 1]} position={[0, 9.5, -50]} receiveShadow>
          <meshStandardMaterial
            color={colors.walls}
            roughness={0.7}
            metalness={0.3}
          />
        </Box>
        <Box args={[1, 20, 100]} position={[-50, 9.5, 0]} receiveShadow>
          <meshStandardMaterial
            color={colors.walls}
            roughness={0.7}
            metalness={0.3}
          />
        </Box>
        <Box args={[1, 20, 100]} position={[50, 9.5, 0]} receiveShadow>
          <meshStandardMaterial
            color={colors.walls}
            roughness={0.7}
            metalness={0.3}
          />
        </Box>

        {/* Aisles */}
        {aisles?.map((aisle, index) => (
          <group
            key={aisle.id}
            onClick={(e) => handleAisleClick(e, aisle.id)}
          >
            <Aisle
              position={aisle.position}
              initialRackCount={3}
              rackSpacing={3}
              accentColor={selectedAisle === aisle.id ? '#4CAF50' : colors.accent[index % colors.accent.length]}
              aisleId={aisle.id}
              racks={aisle.racks}
              onRackUpdate={(data) => updateRackData(aisle.id, data)}
            />
          </group>
        ))}
      </Canvas>
    </div>
  );
};

export default Store;
