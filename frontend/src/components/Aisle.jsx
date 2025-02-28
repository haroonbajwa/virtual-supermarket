import React, { useState, useEffect } from 'react';
import { Text, Box } from '@react-three/drei';
import DoubleRack from './DoubleRack';
import { moveRack, rotateRack } from '../utils/Movement';
import SingleSideRack from './SingleSideRack';

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
  onRackUpdate
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
  const [currentRotation, setCurrentRotation] = useState(0);

  const addRack = (type = 'double') => {
    setCurrentRacks(prevRacks => {
      const newRackId = `R${prevRacks.length + 1}`;
      return [...prevRacks, {
        ...generateRackData(newRackId),
        position: [prevRacks.length * rackSpacing, 0, 0],
        size: { width: 2, depth: 1, height: 3 },
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        type
      }];
    });
  };

  const removeRack = () => {
    if (currentRacks.length > 1) {
      setCurrentRacks(prevRacks => prevRacks.slice(0, -1));
    }
  };

  const handleRackChange = (rackData) => {
    if (onRackUpdate) {
      onRackUpdate(rackData);
    }
  };

  // Handle keyboard movement when aisle is selected
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (event) => {
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
      
      const newPosition = moveRack(currentPosition, direction);
      setCurrentPosition(newPosition);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, currentPosition]);

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
              onClick={() => setCurrentPosition(moveRack(currentPosition, 'up'))}
            />
            {/* Down Button */}
            <ControlButton
              position={[0, 0, 0]}
              label="↓"
              onClick={() => setCurrentPosition(moveRack(currentPosition, 'down'))}
            />
            {/* Left Button */}
            <ControlButton
              position={[-0.4, 0, 0]}
              label="←"
              onClick={() => setCurrentPosition(moveRack(currentPosition, 'left'))}
            />
            {/* Right Button */}
            <ControlButton
              position={[0.4, 0, 0]}
              label="→"
              onClick={() => setCurrentPosition(moveRack(currentPosition, 'right'))}
            />
            {/* Rotate Button */}
            <ControlButton
              position={[0.4, 0.4, 0]}
              label="↻"
              onClick={() => setCurrentRotation(rotateRack(currentRotation))}
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
          <group key={rack.id} position={[index * rackSpacing, 0, 0]}>
            <DoubleRack
              position={[0, 0, 0]}
              size={rack.size}
              color={rack.color}
              rackId={rack.id}
              sides={rack.sides}
              onUpdate={handleRackChange}
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
