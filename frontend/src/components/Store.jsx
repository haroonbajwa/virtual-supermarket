import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Box
} from '@react-three/drei';
import Aisle from './Aisle';
import { layoutService } from '../services/layout.service';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import { setAisles, selectAisles } from '../store/aislesSlice';

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
  const dispatch = useDispatch();
  const aisles = useSelector(selectAisles);
  const [selectedAisle, setSelectedAisle] = useState(null);
  const [isPlacingRegularAisle, setIsPlacingRegularAisle] = useState(false);
  const [layouts, setLayouts] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [layoutName, setLayoutName] = useState('');
  const [pendingChanges, setPendingChanges] = useState(false);
  const [searchResult, setSearchResult] = useState({ visible: false, message: '', isSuccess: false });
  const [highlightedProduct, setHighlightedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef();
  const controlsRef = useRef();

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

    setIsLoading(true);
    try {
      if (selectedLayout) {
        await layoutService.updateLayout(selectedLayout._id, {
          ...selectedLayout,
          name: layoutName,
          aisles: aisles
        });
        const updatedLayouts = layouts.map(l => 
          l._id === selectedLayout._id 
            ? { ...l, name: layoutName }
            : l
        );
        setLayouts(updatedLayouts);
        alert('Layout updated successfully!');
      } else {
        const newLayout = await layoutService.createLayout({
          name: layoutName,
          aisles: aisles
        });
        setLayouts([...layouts, newLayout]);
        setSelectedLayout(newLayout);
        alert('Layout saved successfully!');
      }
      setPendingChanges(false);
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Failed to save layout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadLayout = async (layout) => {
    if (pendingChanges && !window.confirm('You have unsaved changes. Do you want to proceed and lose these changes?')) {
      return;
    }

    setIsLoading(true);
    try {
      const loadedLayout = await layoutService.getLayout(layout._id);
      dispatch(setAisles(loadedLayout.aisles));
      setSelectedLayout(loadedLayout);
      setLayoutName(loadedLayout.name);
      setPendingChanges(false);
    } catch (error) {
      console.error('Error loading layout:', error);
      alert('Failed to load layout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLayout = async (layoutId) => {
    if (!window.confirm('Are you sure you want to delete this layout?')) {
      return;
    }

    setIsLoading(true);
    try {
      await layoutService.deleteLayout(layoutId);
      setLayouts(layouts.filter(l => l._id !== layoutId));
      if (selectedLayout?._id === layoutId) {
        setSelectedLayout(null);
        setLayoutName('');
      }
    } catch (error) {
      console.error('Error deleting layout:', error);
      alert('Failed to delete layout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addAisle = (point) => {
    dispatch(setAisles([
      ...aisles,
      {
        id: aisles.length,
        position: [point.x, 0, point.z],
        aisleDegree: 360,
        racks: Array.from({ length: 3 }, (_, index) => ({
          id: `A${aisles.length}-R${index + 1}`,
          position: [index * 3, 0, 0],
          rackType: 'd-rack', // Default rack type
          sides: {
            left: {
              id: `A${aisles.length}-R${index + 1}-L`,
              shelvesCount: 4,
              slotsPerShelf: [3, 3, 3, 3],
              shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
                id: `A${aisles.length}-R${index + 1}-L-SH${shelfIndex + 1}`,
                slots: Array.from({ length: 3 }, (_, slotIndex) => {
                  const slotId = `A${aisles.length}-R${index + 1}-L-SH${shelfIndex + 1}-S${slotIndex + 1}`;
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
              id: `A${aisles.length}-R${index + 1}-R`,
              shelvesCount: 4,
              slotsPerShelf: [3, 3, 3, 3],
              shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
                id: `A${aisles.length}-R${index + 1}-R-SH${shelfIndex + 1}`,
                slots: Array.from({ length: 3 }, (_, slotIndex) => {
                  const slotId = `A${aisles.length}-R${index + 1}-R-SH${shelfIndex + 1}-S${slotIndex + 1}`;
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
    ]));
    setIsPlacingRegularAisle(false);
  };

  const removeSelectedAisle = () => {
    if (selectedAisle !== null) {
      dispatch(setAisles(aisles.filter(aisle => aisle.id !== selectedAisle)));
      setSelectedAisle(null);
    }
  };

  const updateRackData = (aisleId, rackData) => {
    console.log('Store updating rack data:', { aisleId, rackData });
    
    dispatch(setAisles(aisles.map(aisle => {
      if (aisle.id === aisleId) {
        // Handle aisle position update
        if (rackData.position) {
          console.log('Updating aisle position:', rackData.position);
          const updatedAisle = {
            ...aisle,
            id: aisle.id,
            position: rackData.position,
            aisleDegree: aisle.aisleDegree || 360, // Preserve the existing rotation
            racks: aisle.racks || []
          };
          setPendingChanges(true);
          return updatedAisle;
        }

        // Handle aisle rotation
        if (rackData.aisleDegree !== undefined) {
          console.log('Rotating aisle to:', rackData.aisleDegree);
          const updatedAisle = {
            ...aisle,
            aisleDegree: rackData.aisleDegree
          };
          setPendingChanges(true);
          return updatedAisle;
        }
        
        // Handle rack updates
        if (rackData.racks) {
          console.log('Store handling rack update:', rackData.racks);
          const updatedAisle = {
            ...aisle,
            racks: rackData.racks.map(rack => {
              const updatedRack = {
                ...rack,
                id: rack.id,
                position: rack.position,
                rackDegree: rack.rackDegree,
                rackType: rack.rackType || 'd-rack',
                sides: rack.sides || {
                  left: { shelves: [] },
                  right: { shelves: [] }
                },
                size: rack.size || { width: 2, depth: 1, height: 3 },
                color: rack.color || "hsl(263.1184617437402, 70%, 60%)"
              };
              console.log('Updated rack with data:', updatedRack);
              return updatedRack;
            })
          };
          setPendingChanges(true);
          return updatedAisle;
        }

        // Handle single rack update
        if (rackData.id) {
          const updatedAisle = {
            ...aisle,
            racks: aisle.racks.map(rack => {
              if (rack.id === rackData.id) {
                let updatedRack = { ...rack };
                
                // Update position if provided
                if (rackData.position) {
                  console.log('Updating rack position:', rackData.position);
                  updatedRack = {
                    ...updatedRack,
                    position: rackData.position
                  };
                }

                // Handle slot updates
                if (rackData.updatedSlot) {
                  const { side, shelfIndex, slotIndex, ...slotData } = rackData.updatedSlot;
                  const targetSide = side === 'L' ? 'left' : 'right';
                  
                  updatedRack.sides = {
                    ...rack.sides,
                    [targetSide]: {
                      ...rack.sides[targetSide],
                      shelves: rack.sides[targetSide].shelves.map((shelf, sIndex) => {
                        if (sIndex === shelfIndex) {
                          return {
                            ...shelf,
                            slots: shelf.slots.map((slot, slIndex) => {
                              if (slIndex === slotIndex) {
                                return {
                                  ...slot,
                                  ...slotData
                                };
                              }
                              return slot;
                            })
                          };
                        }
                        return shelf;
                      })
                    }
                  };
                }
                return updatedRack;
              }
              return rack;
            })
          };
          setPendingChanges(true);
          return updatedAisle;
        }
      }
      return aisle;
    })));
    
    console.log('Store updated aisles:', aisles);
  };

  const handlePlaneClick = (event) => {
    if (isPlacingRegularAisle) {
      const point = event.point;
      addAisle(point);
    }
  };

  const handleAisleClick = (event, aisleId) => {
    event.stopPropagation();
    setSelectedAisle(aisleId);
  };

  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
    const term = searchTerm.toLowerCase();
    let found = false;
    
    // Clear any previous highlighted product
    setHighlightedProduct(null);

    // Search through all aisles, racks, shelves, and slots
    for (const aisle of aisles) {
      if (!aisle.racks) continue;
      
      for (const rack of aisle.racks) {
        // Search in left side
        if (rack.sides && rack.sides.left && rack.sides.left.shelves) {
          for (const shelf of rack.sides.left.shelves) {
            if (shelf.slots) {
              for (const slot of shelf.slots) {
                if (slot.productName && 
                    slot.productName.toLowerCase().includes(term)) {
                  found = true;
                  // Set the highlighted product with all necessary information
                  setHighlightedProduct({
                    aisleId: aisle.id,
                    rackId: rack.id,
                    side: 'left',
                    shelfIndex: rack.sides.left.shelves.indexOf(shelf),
                    slotIndex: shelf.slots.indexOf(slot),
                    slotId: slot.id,
                    productName: slot.productName
                  });
                  setSearchResult({
                    visible: true,
                    message: `Found: ${slot.productName}`,
                    isSuccess: true
                  });
                  focusCameraOnRack(aisle.id, rack.id, 'left');
                }
              }
            }
          }
        }

        // Search in right side
        if (rack.sides && rack.sides.right && rack.sides.right.shelves) {
          for (const shelf of rack.sides.right.shelves) {
            if (shelf.slots) {
              for (const slot of shelf.slots) {
                if (slot.productName && 
                    slot.productName.toLowerCase().includes(term)) {
                  found = true;
                  // Set the highlighted product with all necessary information
                  setHighlightedProduct({
                    aisleId: aisle.id,
                    rackId: rack.id,
                    side: 'right',
                    shelfIndex: rack.sides.right.shelves.indexOf(shelf),
                    slotIndex: shelf.slots.indexOf(slot),
                    slotId: slot.id,
                    productName: slot.productName
                  });
                  setSearchResult({
                    visible: true,
                    message: `Found: ${slot.productName}`,
                    isSuccess: true
                  });
                  focusCameraOnRack(aisle.id, rack.id, 'right');
                }
              }
            }
          }
        }
      }
    }

    // If product not found
    if (!found) {
      setSearchResult({
        visible: true,
        message: `"${searchTerm}" does not exist`,
        isSuccess: false
      });
    }
    
    // Hide search result after 3 seconds
    setTimeout(() => {
      setSearchResult({ visible: false, message: '', isSuccess: false });
    }, 3000);
  };

  // Function to focus camera on a specific rack when a product is found
  const focusCameraOnRack = (aisleId, rackId, side) => {
    // Find the aisle and rack
    const aisle = aisles.find(a => a.id === aisleId);
    if (!aisle || !aisle.racks) return;
    
    const rackIndex = aisle.racks.findIndex(r => r.id === rackId);
    if (rackIndex === -1) return;
    
    const rack = aisle.racks[rackIndex];
    
    // Calculate the position to focus on
    const aislePosition = aisle.position;
    const rackPosition = [aislePosition[0] + rackIndex * 3, aislePosition[1], aislePosition[2]];
    
    // Adjust position based on the side (left or right)
    const sideOffset = side === 'left' ? -0.5 : 0.5;
    
    // Calculate rotation to face the correct side of the rack
    const rackRotation = rack.rackDegree ? (rack.rackDegree * Math.PI / 180) : 0;
    
    // Calculate camera position based on rack position, side, and rotation
    const distance = 4; // Reduced distance to get closer to the rack
    const height = 1.8;   // Adjusted height for better view
    
    // Calculate position with rotation consideration
    // For left side, we want to look at it head-on, so rotate 180 degrees
    // For right side, we look at it directly
    const angleFacing = rackRotation + (side === 'left' ? Math.PI : 0);
    const cameraX = rackPosition[0] + Math.sin(angleFacing) * distance;
    const cameraZ = rackPosition[2] + Math.cos(angleFacing) * distance;
    
    // Set camera position and target
    if (cameraRef.current && controlsRef.current) {
      // Animate camera movement to the new position
      const duration = 1500; // Animation duration in ms (extended for smoother motion)
      const startTime = Date.now();
      const startPosition = [cameraRef.current.position.x, cameraRef.current.position.y, cameraRef.current.position.z];
      const targetPosition = [cameraX, rackPosition[1] + height, cameraZ];
      const startTarget = [controlsRef.current.target.x, controlsRef.current.target.y, controlsRef.current.target.z];
      // Target the center of the rack for better viewing
      const targetTarget = [rackPosition[0], rackPosition[1] + 1.5, rackPosition[2]];
      
      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-in-out function for smoother animation
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;
        
        // Update camera position
        cameraRef.current.position.x = startPosition[0] + (targetPosition[0] - startPosition[0]) * easeProgress;
        cameraRef.current.position.y = startPosition[1] + (targetPosition[1] - startPosition[1]) * easeProgress;
        cameraRef.current.position.z = startPosition[2] + (targetPosition[2] - startPosition[2]) * easeProgress;
        
        // Update controls target
        controlsRef.current.target.set(
          startTarget[0] + (targetTarget[0] - startTarget[0]) * easeProgress,
          startTarget[1] + (targetTarget[1] - startTarget[1]) * easeProgress,
          startTarget[2] + (targetTarget[2] - startTarget[2]) * easeProgress
        );
        
        // Force control update to ensure camera movement is applied
        controlsRef.current.update();
        
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        }
      };
      
      animateCamera();
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: colors.background,
      fontFamily: 'Roboto, Arial, sans-serif'
    }}>
      {/* Instructions Box */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        color: 'white',
        maxWidth: '300px'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Instructions</h3>
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
        </div>
      </div>

      {/* Sidebar with Layout Controls and Designer */}
      <Sidebar
        layoutName={layoutName}
        setLayoutName={setLayoutName}
        layouts={layouts}
        selectedLayout={selectedLayout}
        handleSaveLayout={handleSaveLayout}
        handleLoadLayout={handleLoadLayout}
        handleDeleteLayout={handleDeleteLayout}
        isPlacingRegularAisle={isPlacingRegularAisle}
        handleAddAisle={() => setIsPlacingRegularAisle(true)}
        handleRemoveAisle={removeSelectedAisle}
        selectedAisle={selectedAisle}
        isLoading={isLoading}
        pendingChanges={pendingChanges}
      />

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Search Result Notification */}
      {searchResult.visible && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          padding: '12px 20px',
          backgroundColor: searchResult.isSuccess ? 'rgba(46, 125, 50, 0.9)' : 'rgba(198, 40, 40, 0.9)',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 1000,
          fontSize: '16px',
          maxWidth: '80%',
          transition: 'all 0.3s ease'
        }}>
          {searchResult.message}
        </div>
      )}

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
        <PerspectiveCamera makeDefault ref={cameraRef} position={[15, 15, 15]} />
        <OrbitControls
          ref={controlsRef}
          target={[5, 0, 5]}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
          dampingFactor={0.05}
          enabled={!isPlacingRegularAisle}
          // Add boundary constraints to keep camera inside store
          minDistance={2} // Minimum distance from target
          maxDistance={45} // Maximum distance from target to stay inside store
          // Prevent going below floor or above ceiling
          minPolarAngle={0.1} // Slight restriction from directly above
          // Allow full rotation around the target
          rotateSpeed={0.7}
          mouseButtons={{
            LEFT: 0, // Rotate (THREE.MOUSE.LEFT) - set to rotate on left mouse
            MIDDLE: 1, // Dolly (THREE.MOUSE.MIDDLE)
            RIGHT: 2 // Pan (THREE.MOUSE.RIGHT)
          }}
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
        <Environment preset="warehouse" />

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
              initialRackCount={aisle.racks?.length || 3}
              rackSpacing={3}
              accentColor={selectedAisle === aisle.id ? '#4CAF50' : colors.accent[index % colors.accent.length]}
              aisleId={aisle.id}
              racks={aisle.racks}
              onRackUpdate={(rackData) => updateRackData(aisle.id, rackData)}
              rotation={[0, aisle.aisleDegree ? (aisle.aisleDegree * Math.PI / 180) : 0, 0]}
              highlightedProduct={highlightedProduct && highlightedProduct.aisleId === aisle.id ? highlightedProduct : null}
            />
          </group>
        ))}
      </Canvas>
    </div>
  );
};

export default Store;
