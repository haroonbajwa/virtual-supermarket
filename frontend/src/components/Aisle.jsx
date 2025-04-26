import React, { useState, useEffect } from 'react';
import { Text, Box } from '@react-three/drei';
import DoubleRack from './DoubleRack';
import { moveRack } from '../utils/Movement';

// Control Button Component
const ControlButton = ({ position, label, onClick, color = '#4CAF50' }) => (
  <group position={position}>
    <Box args={[0.4, 0.4, 0.1]} onClick={onClick}>
      <meshStandardMaterial color={color} />
    </Box>
    <Text
      position={[0, 0, 0.1]}
      fontSize={0.2}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      {label}
    </Text>
  </group>
);

const generateRackData = (rackId) => {
  return {
    id: rackId,
    position: [0, 0, 0],
    sides: {
      left: {
        id: `${rackId}-L`,
        shelvesCount: 4,
        slotsPerShelf: [3, 3, 3, 3],
        shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
          id: `${rackId}-L-SH${shelfIndex + 1}`,
          slots: Array.from({ length: 3 }, (_, slotIndex) => {
            const slotId = `${rackId}-L-SH${shelfIndex + 1}-S${slotIndex + 1}`;
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
        id: `${rackId}-R`,
        shelvesCount: 4,
        slotsPerShelf: [3, 3, 3, 3],
        shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
          id: `${rackId}-R-SH${shelfIndex + 1}`,
          slots: Array.from({ length: 3 }, (_, slotIndex) => {
            const slotId = `${rackId}-R-SH${shelfIndex + 1}-S${slotIndex + 1}`;
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
    }
  };
};

const Aisle = ({ 
  position, 
  initialRackCount = 2, 
  rackSpacing = 2, 
  accentColor = '#64B5F6',
  aisleId,
  racks,
  onRackUpdate,
  rotation = [0, 0, 0],
  highlightedProduct
}) => {
  const [currentRacks, setCurrentRacks] = useState(racks || Array.from({ length: initialRackCount }, (_, index) => ({
    ...generateRackData(`R${index + 1}`),
    position: [index * rackSpacing, 0, 0],
    size: { width: 2, depth: 1, height: 3 },
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    type: 'double'
  })));

  const [currentPosition, setCurrentPosition] = useState(position);
  const [isSelected, setIsSelected] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(rotation[1]);

  useEffect(() => {
    if (rotation) {
      setCurrentRotation(rotation[1]);
    }
  }, [rotation]);

  useEffect(() => {
    if (racks) {
      setCurrentRacks(racks);
    }
  }, [racks]);

  useEffect(() => {
    if (position) {
      setCurrentPosition(position);
    }
  }, [position]);

  useEffect(() => {
    // Notify parent of position changes
    if (onRackUpdate) {
      onRackUpdate({
        position: currentPosition,
        aisleId: aisleId
      });
    }
  }, [currentPosition]);

  const addRack = (type = 'double') => {
    setCurrentRacks(prevRacks => {
      const newRacks = [...prevRacks, {
        ...generateRackData(`A${aisleId}-R${prevRacks.length + 1}`),
        position: [prevRacks.length * rackSpacing, 0, 0],
        size: { width: 2, depth: 1, height: 3 },
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        type
      }];
      if (onRackUpdate) {
        onRackUpdate({
          action: 'add',
          racks: newRacks
        });
      }
      return newRacks;
    });
  };

  const removeRack = () => {
    if (currentRacks.length > 1) {
      setCurrentRacks(prevRacks => {
        const newRacks = prevRacks.slice(0, -1);
        if (onRackUpdate) {
          onRackUpdate({
            action: 'delete',
            racks: newRacks
          });
        }
        return newRacks;
      });
    }
  };

  const handleRackChange = (rackId, updatedRackData) => {
    console.log('Aisle handling rack change:', { rackId, updatedRackData });
    
    setCurrentRacks(prevRacks => {
      const updatedRacks = prevRacks.map(rack => {
        if (rack.id === rackId) {
          // Handle slot updates
          if (updatedRackData.updatedSlot) {
            const { side, shelfIndex, slotIndex, ...slotData } = updatedRackData.updatedSlot;
            const targetSide = side === 'L' ? 'left' : 'right';
            
            // Create deep copy of rack to update
            const updatedRack = {
              ...rack,
              sides: {
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
              }
            };
            return updatedRack;
          }

          // Handle position updates
          if (updatedRackData.position) {
            return {
              ...rack,
              position: updatedRackData.position,
              rackDegree: rack.rackDegree,
              rackType: rack.rackType,
              sides: rack.sides,
              color: rack.color
            };
          }

          // Handle other updates
          return {
            ...rack,
            ...updatedRackData
          };
        }
        return rack;
      });

      console.log('Aisle sending updated racks:', updatedRacks);
      
      if (onRackUpdate) {
        onRackUpdate({
          aisleId: aisleId,
          racks: updatedRacks
        });
      }
      
      return updatedRacks;
    });
  };

  const handleRotate = () => {
    // Calculate the next rotation in degrees
    const currentDegrees = (currentRotation * 180 / Math.PI) % 360;
    const nextDegrees = (currentDegrees + 90) % 360;
    const finalDegree = nextDegrees === 0 ? 360 : nextDegrees;
    
    // Convert back to radians for Three.js
    const newRotation = (nextDegrees * Math.PI / 180);
    setCurrentRotation(newRotation);
    
    console.log("Rotating aisle:", aisleId, "to degree:", finalDegree);
    
    if (onRackUpdate) {
      onRackUpdate({
        aisleDegree: finalDegree
      });
    }
  };

  // Handle keyboard movement when aisle is selected
  useEffect(() => {
    if (!isSelected) return;

    let isKeyLocked = false; // Prevent rapid key presses

    const handleKeyDown = (event) => {
      // If another key is already being processed, ignore this keypress
      if (isKeyLocked) return;

      let direction = '';
      switch (event.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        default:
          return;
      }
      
      // Lock the key handling to prevent multiple rapid movements
      isKeyLocked = true;

      // Use a function form of setState to ensure we always have the latest state
      setCurrentPosition(prevPosition => {
        const newPosition = moveRack(prevPosition, direction);
        
        // Notify parent about position update with current rotation
        onRackUpdate({
          position: newPosition,
          aisleDegree: ((currentRotation * 180 / Math.PI) % 360) || 360
        });
        
        return newPosition;
      });

      // Release the key lock after a short delay
      setTimeout(() => {
        isKeyLocked = false;
      }, 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, currentRotation]); // Add currentRotation to dependencies

  return (
    <group position={currentPosition} rotation={[0, currentRotation, 0]}>
      {/* Selection Button and Movement Controls */}
      <group position={[currentRacks.length * rackSpacing / 2, 5, 0]}>
        {/* Selection Button */}
        <group position={[0, 0.8, 0]}>
          <Box
            args={[1.2, 0.4, 0.3]}
            onClick={(e) => {
              e.stopPropagation();
              setIsSelected(!isSelected);
            }}
          >
            <meshStandardMaterial color={isSelected ? "#4CAF50" : "#2196F3"} />
          </Box>
          <Text
            position={[0, 0, 0.2]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {isSelected ? "Selected" : "Select"}
          </Text>
        </group>

        {/* Movement Controls - Only show when selected */}
        {isSelected && (
          <group>
            {/* Up Button */}
            <ControlButton
              position={[0, 0.4, 0]}
              label="↑"
              onClick={() => {
                const newPosition = moveRack(currentPosition, 'up');
                setCurrentPosition(newPosition);
                onRackUpdate({
                  position: newPosition,
                  aisleDegree: ((currentRotation * 180 / Math.PI) % 360) || 360
                });
              }}
            />
            {/* Down Button */}
            <ControlButton
              position={[0, 0, 0]}
              label="↓"
              onClick={() => {
                const newPosition = moveRack(currentPosition, 'down');
                setCurrentPosition(newPosition);
                onRackUpdate({
                  position: newPosition,
                  aisleDegree: ((currentRotation * 180 / Math.PI) % 360) || 360
                });
              }}
            />
            {/* Left Button */}
            <ControlButton
              position={[-0.4, 0, 0]}
              label="←"
              onClick={() => {
                const newPosition = moveRack(currentPosition, 'left');
                setCurrentPosition(newPosition);
                onRackUpdate({
                  position: newPosition,
                  aisleDegree: ((currentRotation * 180 / Math.PI) % 360) || 360
                });
              }}
            />
            {/* Right Button */}
            <ControlButton
              position={[0.4, 0, 0]}
              label="→"
              onClick={() => {
                const newPosition = moveRack(currentPosition, 'right');
                setCurrentPosition(newPosition);
                onRackUpdate({
                  position: newPosition,
                  aisleDegree: ((currentRotation * 180 / Math.PI) % 360) || 360
                });
              }}
            />
            {/* Rotate Button */}
            <ControlButton
              position={[0.4, 0.4, 0]}
              label="↻"
              onClick={handleRotate}
              color="#9C27B0"
            />
          </group>
        )}
      </group>

      {/* Aisle Number */}
      <group position={[currentRacks.length * rackSpacing / 2, 4.3, 0]}>
        <Box 
          args={[1.5, 0.8, 0.1]} 
          position={[0, 0, -0.05]}
        >
          <meshBasicMaterial color={accentColor} />
        </Box>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          characters="AISLE0123456789"
        >
          {`AISLE ${Math.floor(position[2] / 5) + 1}`}
        </Text>
      </group>

      {/* Floor Marking */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[currentRacks.length * rackSpacing / 2, -0.48, 0]}
      >
        <planeGeometry args={[currentRacks.length * rackSpacing + 2, 3]} />
        <meshBasicMaterial 
          color={accentColor}
          opacity={0.2}
          transparent
        />
      </mesh>

      {/* Racks */}
      <group>
        {currentRacks.map((rack, index) => (
          <group key={rack.id}>
            <DoubleRack
              position={rack.position}
              size={rack.size || { width: 2, depth: 1, height: 3 }}
              color={rack.color || accentColor}
              rackId={rack.id}
              sides={rack.sides}
              rackType={rack.rackType || 'd-rack'}
              onUpdate={(rackData) => handleRackChange(rack.id, rackData)}
              rotation={rack.rackDegree ? (rack.rackDegree * Math.PI / 180) : 0}
              highlightedProduct={highlightedProduct && highlightedProduct.rackId === rack.id ? highlightedProduct : null}
            />
          </group>
        ))}
      </group>

      {/* Rack Controls */}
      <group position={[currentRacks.length * rackSpacing + 1, 2, 0]}>
        {/* Add Double-Sided Rack Button */}
        <group position={[-0.5, 0, 0]} onClick={(e) => {
          e.stopPropagation();
          addRack('double');
        }}>
          <Box args={[0.8, 0.4, 0.1]}>
            <meshBasicMaterial color="#4CAF50" />
          </Box>
          <Text 
            position={[0, 0, 0.06]} 
            scale={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            + Double
          </Text>
        </group>

        {/* Add Single Side Rack Button */}
        <group position={[-0.5, -0.4, 0]} onClick={(e) => {
          e.stopPropagation();
          addRack('singlesiderack');
        }}>
          <Box args={[0.8, 0.4, 0.1]}>
            <meshBasicMaterial color="#2196F3" />
          </Box>
          <Text 
            position={[0, 0, 0.06]} 
            scale={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            + Single
          </Text>
        </group>

        {/* Remove Rack Button */}
        {currentRacks.length > 1 && (
          <group position={[0.3, -0.4, 0]} onClick={(e) => {
            e.stopPropagation();
            removeRack();
          }}>
            <Box args={[0.8, 0.4, 0.1]}>
              <meshBasicMaterial color="#f44336" />
            </Box>
            <Text 
              position={[0, 0, 0.06]} 
              scale={0.15}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              - Remove
            </Text>
          </group>
        )}
      </group>
    </group>
  );
};

export default Aisle;
