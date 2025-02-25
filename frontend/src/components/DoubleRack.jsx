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
      {/* Title text */}
      <Text
        position={[0, size.height / 2 - 0.1, size.depth / 2]}
        fontSize={0.07}
        color="black"
        anchorX="center"
        anchorY="bottom"
      >
        {title}
      </Text>
    </group>
  );
};

// Shelf Component (Group of Slots)
const Shelf = ({ position, width, height, depth, slotsCount, shelfColor, slotColors }) => {
  // Calculate slot width to fill entire shelf width
  const slotWidth = width / slotsCount;
  const slots = [];

  // Start from left edge and build right
  const startX = -width / 2;

  for (let i = 0; i < slotsCount; i++) {
    const slotPosition = [
      startX + (i * slotWidth) + (slotWidth / 2), // Position from left to right
      position[1],
      position[2]
    ];

    slots.push(
      <Slot
        key={`slot-${i}`}
        position={slotPosition}
        size={{
          width: slotWidth - 0.05, // Small gap between slots
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
        position={[position[0], position[1] - height / 2, position[2]]} // Move shelf base 50% down
      >
        <meshStandardMaterial
          color={shelfColor}
          //transparent={true}
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
const RackSide = ({
  position,
  size,
  shelvesCount,
  slotsPerShelf,
  shelfColors,
  slotColors,
  isRightSide,
  onShelfSelect,
  selectedShelfIndex
}) => {
  const shelves = [];

  // Calculate shelf height to fill entire space
  const shelfHeight = size.height / shelvesCount;
  // Start from bottom (0) and build up
  const startY = 0;

  // Calculate rotation for left side (180 degrees = Math.PI)
  const rotation = isRightSide ? [0, 0, 0] : [0, Math.PI, 0];

  for (let i = 0; i < shelvesCount; i++) {
    const shelfPosition = [
      position[0],
      startY + (i * shelfHeight) + (shelfHeight / 2), // Position from bottom up
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
          height={shelfHeight - 0.1} // Small gap between shelves
          depth={size.depth / 2 - 0.1}
          slotsCount={slotsPerShelf[i]}
          shelfColor={i === selectedShelfIndex ? '#f39c12' : shelfColors[i % shelfColors.length]}
          slotColors={slotColors}
        />
      </group>
    );
  }

  return (
    <group
      position={[0, 0, isRightSide ? size.depth / 4 : -size.depth / 4]}
      rotation={rotation}
    >
      {shelves}
    </group>
  );
};

const DoubleRack = ({
  position = [0, 0, 0],
  size = { width: 3, height: 4, depth: 1 },
  color = '#34495e'
}) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isSelected, setIsSelected] = useState(false);
  const [leftShelves, setLeftShelves] = useState(4);
  const [rightShelves, setRightShelves] = useState(4);
  const [selectedShelf, setSelectedShelf] = useState({ side: null, index: -1 });
  const [leftSlotsPerShelf, setLeftSlotsPerShelf] = useState([3, 3, 3, 3, 3, 3]);
  const [rightSlotsPerShelf, setRightSlotsPerShelf] = useState([3, 3, 3, 3, 3, 3]);

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

  // Different colors for shelves and slots
  const leftShelfColors = [
    '#3498db',  // Blue
    '#e74c3c',  // Red
    '#2ecc71',  // Green
    '#f1c40f',  // Yellow
    '#9b59b6',  // Purple
    '#1abc9c'   // Teal
  ];

  const rightShelfColors = [
    '#e67e22',  // Orange
    '#16a085',  // Dark Teal
    '#8e44ad',  // Dark Purple
    '#c0392b',  // Dark Red
    '#27ae60',  // Dark Green
    '#2980b9'   // Dark Blue
  ];

  const leftSlotColors = [
    ['#bdc3c7', '#95a5a6', '#7f8c8d'],  // Grays
    ['#ffcdd2', '#ef9a9a', '#e57373'],  // Reds
    ['#c8e6c9', '#a5d6a7', '#81c784'],  // Greens
    ['#fff9c4', '#fff59d', '#fff176'],  // Yellows
    ['#e1bee7', '#ce93d8', '#ba68c8'],  // Purples
    ['#b2ebf2', '#80deea', '#4dd0e1']   // Blues
  ];

  const rightSlotColors = [
    ['#ffe0b2', '#ffb74d', '#ffa726'],  // Oranges
    ['#b2dfdb', '#80cbc4', '#4db6ac'],  // Teals
    ['#d1c4e9', '#b39ddb', '#9575cd'],  // Light Purples
    ['#ffcdd2', '#ef9a9a', '#e57373'],  // Light Reds
    ['#c8e6c9', '#a5d6a7', '#81c784'],  // Light Greens
    ['#bbdefb', '#90caf9', '#64b5f6']   // Light Blues
  ];

  const handleShelfChange = (side, action) => {
    if (side === 'left') {
      if (action === 'add' && leftShelves < 6) {
        setLeftShelves(prev => prev + 1);
      } else if (action === 'remove' && leftShelves > 1) {
        setLeftShelves(prev => prev - 1);
      }
    } else {
      if (action === 'add' && rightShelves < 6) {
        setRightShelves(prev => prev + 1);
      } else if (action === 'remove' && rightShelves > 1) {
        setRightShelves(prev => prev - 1);
      }
    }
  };

  const handleSlotChange = (action) => {
    if (!selectedShelf.side) return;

    const isLeft = selectedShelf.side === 'left';
    const currentSlots = isLeft ? leftSlotsPerShelf : rightSlotsPerShelf;
    const setSlots = isLeft ? setLeftSlotsPerShelf : setRightSlotsPerShelf;
    const currentShelfSlots = currentSlots[selectedShelf.index];

    if (action === 'add' && currentShelfSlots < 6) {
      const newSlots = [...currentSlots];
      newSlots[selectedShelf.index]++;
      setSlots(newSlots);
    } else if (action === 'remove' && currentShelfSlots > 1) {
      const newSlots = [...currentSlots];
      newSlots[selectedShelf.index]--;
      setSlots(newSlots);
    }
  };

  const handleShelfSelect = (side, index) => {
    setSelectedShelf({ side, index });
  };

  return (
    <group position={currentPosition} rotation={[0, currentRotation, 0]}>
      {/* Movement Controls - Only show when selected */}
      {isSelected && (
        <group>
          {/* Up Button */}
          <ControlButton
            position={[0, 4.8, 0]}
            label="↑"
            onClick={() => setCurrentPosition(moveRack(currentPosition, 'up'))}
          />
          {/* Down Button */}
          <ControlButton
            position={[0, 4.5, 0]}
            label="↓"
            onClick={() => setCurrentPosition(moveRack(currentPosition, 'down'))}
          />
          {/* Left Button */}
          <ControlButton
            position={[-0.3, 4.5, 0]}
            label="←"
            onClick={() => setCurrentPosition(moveRack(currentPosition, 'left'))}
          />
          {/* Right Button */}
          <ControlButton
            position={[0.3, 4.5, 0]}
            label="→"
            onClick={() => setCurrentPosition(moveRack(currentPosition, 'right'))}
          />
          {/* Rotate Button */}
          <ControlButton
            position={[0.3, 4.8, 0]}
            label="↻"
            onClick={handleRotate}
            color="#9C27B0"
          />
        </group>
      )}
      {/* Controls Container */}
      <group position={[0, size.height, 0]}>
        {/* Selection Button - Centered and Above */}
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

      {/* Left Side */}
      <RackSide
        position={[0, 0, 0]}
        size={size}
        shelvesCount={leftShelves}
        slotsPerShelf={leftSlotsPerShelf}
        shelfColors={leftShelfColors}
        slotColors={leftSlotColors[Math.min(leftShelves - 1, 5)]}
        isRightSide={false}
        onShelfSelect={(index) => handleShelfSelect('left', index)}
        selectedShelfIndex={selectedShelf.side === 'left' ? selectedShelf.index : -1}
      />

      {/* Right Side */}
      <RackSide
        position={[0, 0, 0]}
        size={size}
        shelvesCount={rightShelves}
        slotsPerShelf={rightSlotsPerShelf}
        shelfColors={rightShelfColors}
        slotColors={rightSlotColors[Math.min(rightShelves - 1, 5)]}
        isRightSide={true}
        onShelfSelect={(index) => handleShelfSelect('right', index)}
        selectedShelfIndex={selectedShelf.side === 'right' ? selectedShelf.index : -1}
      />

      {/* Control Panel on Top */}
      <group position={[0, size.height + 0.3, 0]}>
        {/* Left Side Controls */}
        <group position={[-size.width / 2 + 0.5, 0, -size.depth / 4]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.15}
            color="black"
            anchorX="center"
            rotation={[0, Math.PI, 0]}
          >
            Left Side
          </Text>
          <group position={[-0.2, -0.2, 0]}>
            <ControlButton
              position={[0, 0, 0]}
              label="-"
              onClick={() => handleShelfChange('left', 'remove')}
              color="#e74c3c"
            />
            <Text
              position={[0.2, 0, 0]}
              fontSize={0.15}
              color="black"
              anchorX="center"
              rotation={[0, Math.PI, 0]}
            >
              {leftShelves}
            </Text>
            <ControlButton
              position={[0.4, 0, 0]}
              label="+"
              onClick={() => handleShelfChange('left', 'add')}
            />
          </group>
          {selectedShelf.side === 'left' && selectedShelf.index !== -1 && (
            <group position={[1, -0.2, 0]}>
              <Text
                position={[0, 0.2, 0]}
                fontSize={0.12}
                color="black"
                anchorX="center"
                rotation={[0, Math.PI, 0]}
              >
                Slots: {leftSlotsPerShelf[selectedShelf.index]}
              </Text>
              <ControlButton
                position={[-0.2, 0, 0]}
                label="-"
                onClick={() => handleSlotChange('remove')}
                color="#e74c3c"
              />
              <ControlButton
                position={[0.2, 0, 0]}
                label="+"
                onClick={() => handleSlotChange('add')}
              />
            </group>
          )}
        </group>

        {/* Right Side Controls */}
        <group position={[-size.width / 2 + 0.5, 0, size.depth / 4]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.15}
            color="black"
            anchorX="center"
          >
            Right Side
          </Text>
          <group position={[-0.2, -0.2, 0]}>
            <ControlButton
              position={[0, 0, 0]}
              label="-"
              onClick={() => handleShelfChange('right', 'remove')}
              color="#e74c3c"
            />
            <Text
              position={[0.2, 0, 0]}
              fontSize={0.15}
              color="black"
              anchorX="center"
            >
              {rightShelves}
            </Text>
            <ControlButton
              position={[0.4, 0, 0]}
              label="+"
              onClick={() => handleShelfChange('right', 'add')}
            />
          </group>
          {selectedShelf.side === 'right' && selectedShelf.index !== -1 && (
            <group position={[1, -0.2, 0]}>
              <Text
                position={[0, 0.2, 0]}
                fontSize={0.12}
                color="black"
                anchorX="center"
              >
                Slots: {rightSlotsPerShelf[selectedShelf.index]}
              </Text>
              <ControlButton
                position={[-0.2, 0, 0]}
                label="-"
                onClick={() => handleSlotChange('remove')}
                color="#e74c3c"
              />
              <ControlButton
                position={[0.2, 0, 0]}
                label="+"
                onClick={() => handleSlotChange('add')}
              />
            </group>
          )}
        </group>
      </group>
    </group>
  );
};

export default DoubleRack;
