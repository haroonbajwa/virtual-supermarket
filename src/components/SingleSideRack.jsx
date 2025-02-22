import React, { useState, useEffect } from 'react';
import { Box, Text } from '@react-three/drei';
import { moveRack, rotateRack } from '../utils/Movement';

// Control Button Component
const ControlButton = ({ position, label, onClick, color = '#4CAF50' }) => (
  <group position={position} onClick={onClick}>
    <Box args={[0.3, 0.3, 0.1]}>
      <meshStandardMaterial color={color} />
    </Box>
    <Text
      position={[0, 0, 0.06]}
      fontSize={0.1}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      {label}
    </Text>
  </group>
);

// Individual Slot Component
const Slot = ({ position, size, color, title = "Product", description = "Description" }) => {
  return (
    <group position={position}>
      <Box args={[size.width, size.height, size.depth]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Text
        position={[0, size.height/2 - 0.1, size.depth/2]}
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="top"
        maxWidth={size.width}
      >
        {description}
      </Text>
    </group>
  );
};

// Shelf Component (Group of Slots)
const Shelf = ({ position, width, height, depth, slotsCount, shelfColor, slotColors }) => {
  const slotWidth = width / slotsCount;
  const slots = [];

  // Start from left edge and build right
  const startX = -width/2;

  for (let i = 0; i < slotsCount; i++) {
    const slotPosition = [
      startX + (i * slotWidth) + (slotWidth / 2),
      position[1],
      position[2]
    ];

    slots.push(
      <Slot
        key={`slot-${i}`}
        position={slotPosition}
        size={{
          width: slotWidth - 0.05,
          height: height - 0.05,
          depth: depth - 0.05
        }}
        color={slotColors[i % slotColors.length]}
        title={`Product ${i + 1}`}
        description={`Description for product ${i + 1}`}
      />
    );
  }

  return (
    <group>
      {/* Shelf Base */}
      <Box
        args={[width, 0.05, depth]}
        position={[position[0], position[1] - height/2, position[2]]}
      >
        <meshStandardMaterial
          color={shelfColor}
          opacity={1}
          roughness={0.7}
          metalness={0.3}
        />
      </Box>
      {slots}
    </group>
  );
};

// RackSide Component (Group of Shelves)
const RackSide = ({ position, size, shelvesCount, slotsPerShelf, shelfColors, slotColors, onShelfSelect, selectedShelfIndex }) => {
  const shelves = [];
  
  // Calculate shelf height to fill entire space
  const shelfHeight = size.height / shelvesCount;
  const startY = 0;

  // Right side has no rotation (0 degrees)
  const rotation = [0, 0, 0];

  for (let i = 0; i < shelvesCount; i++) {
    const shelfPosition = [
      position[0],
      startY + (i * shelfHeight) + (shelfHeight / 2),
      position[2]
    ];

    shelves.push(
      <group 
        key={`shelf-${i}`} 
        onClick={(e) => {
          e.stopPropagation();
          onShelfSelect(i);
        }}
      >
        <Shelf
          position={shelfPosition}
          width={size.width - 0.2}
          height={shelfHeight - 0.1}
          depth={size.depth/2 - 0.1}
          slotsCount={slotsPerShelf[i]}
          shelfColor={i === selectedShelfIndex ? '#f39c12' : shelfColors[i % shelfColors.length]}
          slotColors={slotColors}
        />
      </group>
    );
  }

  return (
    <group 
      position={[0, 0, size.depth/4]}
      rotation={rotation}
    >
      {shelves}
    </group>
  );
};

const SingleSideRack = ({
  position = [0, 0, 0],
  size = { width: 3, height: 4, depth: 1 },
  color = '#34495e'
}) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isSelected, setIsSelected] = useState(false);
  const [shelves, setShelves] = useState(4);
  const [selectedShelf, setSelectedShelf] = useState({ index: -1 });
  const [slotsPerShelf, setSlotsPerShelf] = useState([3, 3, 3, 3, 3, 3]);

  // Handle keyboard movement when rack is selected
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
        case 'r':
          setCurrentRotation(rotateRack(currentRotation));
          return;
        default:
          return;
      }
      
      const newPosition = moveRack(currentPosition, direction);
      setCurrentPosition(newPosition);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, currentPosition, currentRotation]);

  // Handle rotation
  const handleRotate = () => {
    setCurrentRotation(rotateRack(currentRotation));
  };

  // Handle shelf changes
  const handleShelfChange = (action) => {
    if (action === 'add' && shelves < 6) {
      setShelves(prev => prev + 1);
    } else if (action === 'remove' && shelves > 1) {
      setShelves(prev => prev - 1);
    }
  };

  // Handle slot changes
  const handleSlotChange = (action) => {
    if (selectedShelf.index === -1) return;

    const currentShelfSlots = slotsPerShelf[selectedShelf.index];
    
    if (action === 'add' && currentShelfSlots < 6) {
      const newSlots = [...slotsPerShelf];
      newSlots[selectedShelf.index]++;
      setSlotsPerShelf(newSlots);
    } else if (action === 'remove' && currentShelfSlots > 1) {
      const newSlots = [...slotsPerShelf];
      newSlots[selectedShelf.index]--;
      setSlotsPerShelf(newSlots);
    }
  };

  // Different colors for shelves and slots
  const shelfColors = [
    '#e67e22',  // Orange
    '#16a085',  // Dark Teal
    '#8e44ad',  // Dark Purple
    '#c0392b',  // Dark Red
    '#27ae60',  // Dark Green
    '#2980b9'   // Dark Blue
  ];

  const slotColors = [
    ['#ffe0b2', '#ffb74d', '#ffa726'],  // Oranges
    ['#b2dfdb', '#80cbc4', '#4db6ac'],  // Teals
    ['#d1c4e9', '#b39ddb', '#9575cd'],  // Light Purples
    ['#ffcdd2', '#ef9a9a', '#e57373'],  // Light Reds
    ['#c8e6c9', '#a5d6a7', '#81c784'],  // Light Greens
    ['#bbdefb', '#90caf9', '#64b5f6']   // Light Blues
  ];

  const handleShelfSelect = (index) => {
    setSelectedShelf({ index });
  };

  return (
    <group position={currentPosition} rotation={[0, currentRotation, 0]}>
      {/* Controls Container */}
      <group position={[0, size.height + 1, 0]}>
        {/* Title and Selection Button */}
        <group position={[0, 0.8, 0]}>
          <Box
            args={[2, 0.4, 0.3]}
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
            Right Side Rack {isSelected ? "(Selected)" : ""}
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
              position={[0, -0.4, 0]}
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
              position={[0.8, 0.4, 0]}
              label="↻"
              onClick={handleRotate}
              color="#9C27B0"
            />
            {/* Add/Remove Shelf Buttons */}
            <group position={[-0.8, 0.4, 0]}>
              <Text
                position={[0, 0.2, 0]}
                fontSize={0.15}
                color="black"
                anchorX="center"
                anchorY="middle"
              >
                Shelves: {shelves}
              </Text>
              <ControlButton
                position={[0.2, 0, 0]}
                label="+"
                onClick={() => handleShelfChange('add')}
                color="#2ecc71"
              />
              <ControlButton
                position={[-0.2, 0, 0]}
                label="-"
                onClick={() => handleShelfChange('remove')}
                color="#e74c3c"
              />
            </group>
            {/* Add/Remove Slot Buttons - Only show when shelf is selected */}
            {selectedShelf.index !== -1 && (
              <group position={[0.8, 0, 0]}>
                <Text
                  position={[0, 0.2, 0]}
                  fontSize={0.15}
                  color="black"
                  anchorX="center"
                  anchorY="middle"
                >
                  Slots: {slotsPerShelf[selectedShelf.index]}
                </Text>
                <ControlButton
                  position={[0.2, 0, 0]}
                  label="+"
                  onClick={() => handleSlotChange('add')}
                  color="#2ecc71"
                />
                <ControlButton
                  position={[-0.2, 0, 0]}
                  label="-"
                  onClick={() => handleSlotChange('remove')}
                  color="#e74c3c"
                />
              </group>
            )}
          </group>
        )}
      </group>

      {/* Vertical Supports */}
      {[...Array(2)].map((_, i) => (
        <Box 
          key={`support-${i}`}
          args={[0.1, size.height, 0.1]}
          position={[
            (i === 0 ? -1 : 1) * (size.width / 2),
            size.height / 2,
            0
          ]}
        >
          <meshStandardMaterial 
            color={color} 
            roughness={0.8}
            metalness={0.3}
          />
        </Box>
      ))}

      {/* Left Side - Plain Surface */}
      <Box
        args={[size.width - 0.2, size.height, size.depth/2 - 0.1]}
        position={[0, size.height/2, -size.depth/4]}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.3}
        />
      </Box>

      {/* Right Side with Slots */}
      <RackSide
        position={[0, 0, 0]}
        size={size}
        shelvesCount={shelves}
        slotsPerShelf={slotsPerShelf}
        shelfColors={shelfColors}
        slotColors={slotColors[Math.min(shelves - 1, 5)]}
        onShelfSelect={handleShelfSelect}
        selectedShelfIndex={selectedShelf.index}
      />
    </group>
  );
};

export default SingleSideRack;
