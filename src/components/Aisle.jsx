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

const Aisle = ({ 
  position, 
  initialRackCount = 2, 
  rackSpacing = 2, 
  accentColor = '#64B5F6' 
}) => {
  const [racks, setRacks] = useState(
    Array.from({ length: initialRackCount }, (_, index) => ({
      id: index,
      shelves: 3,
      size: { width: 2, depth: 1, height: 3 },
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      type: 'double' // 'double', 'singlesiderack'
    }))
  );

  const [currentPosition, setCurrentPosition] = useState(position);
  const [isSelected, setIsSelected] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);

  const addRack = (type = 'double') => {
    setRacks(prevRacks => [
      ...prevRacks, 
      { 
        id: prevRacks.length, 
        shelves: 3,
        size: { width: 2, depth: 1, height: 3 },
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        type
      }
    ]);
  };

  const removeRack = () => {
    if (racks.length > 1) {
      setRacks(prevRacks => prevRacks.slice(0, -1));
    }
  };

  const updateRackShelves = (rackIndex, newShelfCount) => {
    setRacks(prevRacks => 
      prevRacks.map((rack, index) => 
        index === rackIndex 
          ? { ...rack, shelves: newShelfCount }
          : rack
      )
    );
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
      <group position={[racks.length * rackSpacing / 2, 5, 0]}>
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
      <group position={[racks.length * rackSpacing / 2, 4.3, 0]}>
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
        position={[racks.length * rackSpacing / 2, -0.48, 0]}
      >
        <planeGeometry args={[racks.length * rackSpacing + 2, 3]} />
        <meshBasicMaterial 
          color={accentColor}
          opacity={0.2}
          transparent
        />
      </mesh>

      {/* Racks */}
      <group>
        {racks.map((rack, index) => {
          const rackProps = {
            key: rack.id,
            position: [index * rackSpacing, 0, 0],
            size: rack.size,
            shelves: rack.shelves,
            color: rack.color,
            onUpdateShelves: (newShelfCount) => updateRackShelves(index, newShelfCount)
          };

          switch (rack.type) {
            case 'singlesiderack':
              return <SingleSideRack {...rackProps} />;
            default:
              return <DoubleRack {...rackProps} />;
          }
        })}
      </group>

      {/* Rack Controls */}
      <group position={[racks.length * rackSpacing + 1, 2, 0]}>
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
        {racks.length > 1 && (
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
