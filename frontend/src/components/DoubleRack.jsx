import React, { useState, useEffect } from 'react';
import { Box, Text } from '@react-three/drei';
import { moveRack, rotateRack } from '../utils/Movement';
import SlotForm from './SlotForm';

// Control Button Component
const ControlButton = ({ position, label, onClick, color = '#4CAF50', labelColor = 'white' }) => (
  <group position={position} onClick={onClick}>
    <Box args={[0.35, 0.3, 0.1]}>
      <meshStandardMaterial color={color} />
    </Box>
    <Text
      position={[0, 0, 0.06]}
      fontSize={0.1}
      color={labelColor}
      anchorX="center"
      anchorY="middle"
    >
      {label}
    </Text>
  </group>
);

// Individual Slot Component
const Slot = ({ position, size, color, slotData, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation();
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;

    if (timeDiff < 300) {  // Double click threshold of 300ms
      setShowForm(true);
      setIsSelected(false);
    } else {
      setIsSelected(!isSelected);
    }

    setLastClickTime(currentTime);
  };

  const handleSlotSave = (updatedSlot) => {
    if (onUpdate) {
      onUpdate(updatedSlot);
    }
    setShowForm(false);
  };

  return (
    <group position={position} onClick={handleClick}>
      {/* Main slot with projector effect */}
      <Box args={[size.width, size.height, size.depth]}>
        <meshStandardMaterial 
          color={isSelected ? '#4CAF50' : color} 
          emissive={isSelected ? '#4CAF50' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </Box>
      <Text
        position={[0, size.height / 2 -0.3, size.depth / 2+0.01]}
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="bottom"
      >
        {slotData.productName}
      </Text>

      {/* Projection effect when selected */}
      {isSelected && (
        <>
          {/* Light beam effect */}
          <mesh position={[0, 0, size.depth]}>
            <planeGeometry args={[size.width * 2, size.height * 2]} />
            <meshBasicMaterial color="#4CAF50" transparent opacity={0.05} />
          </mesh>

          {/* Projected info panel */}
          <group position={[0, 0, size.depth * 2]}>
            {/* Background panel with projection effect */}
            <Box args={[2, 1.2, 0.01]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.8}
                emissive="#ffffff"
                emissiveIntensity={0.2}
              />
            </Box>
            
            {/* Product info with hologram-like effect */}
            <Text
              position={[0, 0.4, 0.02]}
              fontSize={0.15}
              color="#4CAF50"
              anchorX="center"
              anchorY="center"
              fontWeight="bold"
            >
              {slotData.productName}
            </Text>

            <Text
              position={[0, 0.1, 0.02]}
              fontSize={0.12}
              color="#333333"
              anchorX="center"
              anchorY="center"
            >
              {`ID: ${slotData.productId}`}
            </Text>
            <Text
              position={[0, -0.15, 0.02]}
              fontSize={0.12}
              color="#333333"
              anchorX="center"
              anchorY="center"
            >
              {`Price: $${slotData.price}`}
            </Text>
            <Text
              position={[0, -0.4, 0.02]}
              fontSize={0.12}
              color="#333333"
              anchorX="center"
              anchorY="center"
            >
              {`Stock: ${slotData.quantity} units`}
            </Text>
          </group>
        </>
      )}

      {showForm && (
        <SlotForm
          slot={slotData}
          onSave={handleSlotSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </group>
  );
};

// Shelf Component (Group of Slots)
const Shelf = ({ position, width, height, depth, slotsCount, shelfColor, slotColors, shelfId, slots, onSlotUpdate }) => {
  const slotComponents = [];
  const startX = -width / 2;
  const slotWidth = width / slotsCount;

  const handleSlotUpdate = (updatedSlot) => {
    if (onSlotUpdate) {
      onSlotUpdate(updatedSlot);
    }
  };

  for (let i = 0; i < slotsCount; i++) {
    const slotPosition = [
      startX + (i * slotWidth) + (slotWidth / 2),
      position[1],
      position[2]
    ];

    const defaultSlotData = {
      id: `${shelfId}-S${i + 1}`,
      productId: 'P484',
      productName: `Product ${i + 1}`,
      description: `Description for product in ${shelfId}-S${i + 1}`,
      price: '68.78',
      quantity: 49
    };

    const slotData = slots?.[i] || defaultSlotData;

    slotComponents.push(
      <Slot
        key={`slot-${i}`}
        position={slotPosition}
        size={{
          width: slotWidth - 0.05,
          height: height - 0.05,
          depth: depth - 0.05
        }}
        color={slotColors[i % slotColors.length]}
        slotData={slotData}
        onUpdate={handleSlotUpdate}
      />
    );
  }

  return (
    <group>
      <Box
        args={[width, 0.05, depth]}
        position={[position[0], position[1] - height / 2, position[2]]}
      >
        <meshStandardMaterial
          color={shelfColor}
          roughness={0.7}
          metalness={0.3}
        />
      </Box>
      {slotComponents}
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
  selectedShelfIndex,
  rackId,
  shelves,
  side,
  onSlotUpdate
}) => {
  const shelfComponents = [];
  const shelfHeight = size.height / shelvesCount;
  const startY = 0;
  const rotation = isRightSide ? [0, 0, 0] : [0, Math.PI, 0];

  const handleSlotUpdate = (updatedSlot) => {
    if (onSlotUpdate) {
      onSlotUpdate(updatedSlot);
    }
  };

  for (let i = 0; i < shelvesCount; i++) {
    const shelfId = `${rackId}-${side}-SH${i + 1}`;
    const shelfPosition = [
      position[0],
      startY + (i * shelfHeight) + (shelfHeight / 2),
      position[2]
    ];

    const defaultShelf = {
      id: shelfId,
      slots: Array(slotsPerShelf[i]).fill().map((_, slotIndex) => ({
        id: `${shelfId}-S${slotIndex + 1}`,
        productId: 'P484',
        productName: `Product ${slotIndex + 1}`,
        description: `Description for product in ${shelfId}-S${slotIndex + 1}`,
        price: '68.78',
        quantity: 49
      }))
    };

    const currentShelf = shelves?.[i] || defaultShelf;

    shelfComponents.push(
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
          depth={size.depth / 2 - 0.1}
          slotsCount={slotsPerShelf[i]}
          shelfColor={i === selectedShelfIndex ? '#f39c12' : shelfColors[i % shelfColors.length]}
          slotColors={slotColors}
          shelfId={shelfId}
          slots={currentShelf.slots}
          onSlotUpdate={handleSlotUpdate}
        />
      </group>
    );
  }

  return (
    <group
      position={[0, 0, isRightSide ? size.depth / 4 : -size.depth / 4]}
      rotation={rotation}
    >
      {shelfComponents}
    </group>
  );
};

// Simple Plane for hidden sides
const SimplePlane = ({ side }) => {
  const xOffset = side === 'left' ? -1.5 : 1.5;
  return (
    <mesh position={[xOffset, 2, 0]} rotation={[0, side === 'left' ? Math.PI/2 : -Math.PI/2, 0]}>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial color="#cccccc" opacity={0.8} transparent />
    </mesh>
  );
};

const DoubleRack = ({
  position = [0, 0, 0],
  size = { width: 3, height: 4, depth: 1 },
  color = '#34495e',
  rackId,
  sides,
  rackType = 'd-rack', // Add rackType prop with default
  onUpdate,
  rotation = 0
}) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [currentRotation, setCurrentRotation] = useState(rotation);
  const [isSelected, setIsSelected] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState({ side: null, index: -1 });
  const [hiddenSide, setHiddenSide] = useState(null);
  const [rackDegree, setRackDegree] = useState(rotation * 180 / Math.PI || 360);

  // Initialize hiddenSide based on rackType
  useEffect(() => {
    if (rackType === 'l-rack') {
      setHiddenSide('right');
    } else if (rackType === 'r-rack') {
      setHiddenSide('left');
    } else {
      // 'd-rack' or any other type
      setHiddenSide(null);
    }
  }, [rackType]);

  useEffect(() => {
    setCurrentRotation(rotation);
    setRackDegree(rotation * 180 / Math.PI || 360);
  }, [rotation]);

  // Update current position when position prop changes
  useEffect(() => {
    console.log('DoubleRack receiving new position:', position);
    setCurrentPosition(position);
  }, [position]);

  useEffect(() => {
    // Notify parent of position changes
    if (onUpdate) {
      const updateData = {
        id: rackId,
        position: currentPosition,
        rackDegree: rackDegree,
        sides: {
          left: { ...sides.left },
          right: { ...sides.right }
        }
      };
      console.log('Rack sending position update:', updateData);
      onUpdate(updateData);
    }
  }, [currentPosition]);

  const handleShelfChange = (side, action) => {
    const newSides = { ...sides };
    const targetSide = side === 'left' ? newSides.left : newSides.right;

    if (action === 'add' && targetSide.shelves.length < 6) {
      targetSide.shelves.push({
        id: `${rackId}-${side}-SH${targetSide.shelves.length + 1}`,
        slots: Array(3).fill().map((_, i) => ({
          id: `${rackId}-${side}-SH${targetSide.shelves.length + 1}-S${i + 1}`,
          productId: '',
          productName: `Product ${i + 1}`,
          description: `Description for slot ${i + 1}`,
          price: '',
          quantity: 0
        }))
      });
      targetSide.shelvesCount = targetSide.shelves.length;
      targetSide.slotsPerShelf = targetSide.shelves.map(shelf => shelf.slots.length);
    } else if (action === 'remove' && targetSide.shelves.length > 1) {
      targetSide.shelves.pop();
      targetSide.shelvesCount = targetSide.shelves.length;
      targetSide.slotsPerShelf = targetSide.shelves.map(shelf => shelf.slots.length);
    }

    if (onUpdate) {
      onUpdate({
        id: rackId,
        position: currentPosition,
        rotation: currentRotation,
        sides: newSides
      });
    }
  };

  const handleSlotChange = (action) => {
    if (!selectedShelf.side) return;

    const newSides = { ...sides };
    const targetSide = selectedShelf.side === 'left' ? newSides.left : newSides.right;
    const targetShelf = targetSide.shelves[selectedShelf.index];

    if (!targetShelf) return;

    if (action === 'add' && targetShelf.slots.length < 6) {
      const newSlotId = `${targetShelf.id}-S${targetShelf.slots.length + 1}`;
      targetShelf.slots.push({
        id: newSlotId,
        productId: '',
        productName: `Product ${targetShelf.slots.length + 1}`,
        description: `Description for slot ${targetShelf.slots.length + 1}`,
        price: '',
        quantity: 0
      });
      targetSide.slotsPerShelf = targetSide.shelves.map(shelf => shelf.slots.length);
    } else if (action === 'remove' && targetShelf.slots.length > 1) {
      targetShelf.slots.pop();
      targetSide.slotsPerShelf = targetSide.shelves.map(shelf => shelf.slots.length);
    }

    if (onUpdate) {
      onUpdate({
        id: rackId,
        position: currentPosition,
        rotation: currentRotation,
        sides: newSides
      });
    }
  };

  const handleSlotUpdate = (updatedSlot) => {
    if (onUpdate) {
      // Extract the shelf and slot indices from the slot ID
      const idParts = updatedSlot.id.split('-');
      const side = idParts[2]; // 'L' or 'R'
      const shelfIndex = parseInt(idParts[3].replace('SH', '')) - 1;
      const slotIndex = parseInt(idParts[4].replace('S', '')) - 1;

      console.log('Updating slot in DoubleRack:', {
        id: rackId,
        updatedSlot: {
          ...updatedSlot,
          side,
          shelfIndex,
          slotIndex
        }
      });
      
      onUpdate({
        id: rackId,
        updatedSlot: {
          ...updatedSlot,
          side,
          shelfIndex,
          slotIndex
        }
      });
    }
  };

  const handleRackTypeChange = (newType) => {
    if (onUpdate) {
      onUpdate({
        id: rackId,
        rackType: newType,
        sides: {
          left: { ...sides.left, rackType: newType },
          right: { ...sides.right, rackType: newType }
        }
      });
    }
  };

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
    const newRotation = rotateRack(currentRotation);
    setCurrentRotation(newRotation);
    
    // Calculate degrees based on rotation
    const degrees = (newRotation * 180 / Math.PI) % 360;
    const rotationDegree = Math.round(degrees / 90) * 90;
    const finalDegree = rotationDegree === 0 ? 360 : rotationDegree;
    
    setRackDegree(finalDegree);
    
    if (onUpdate) {
      const updateData = {
        id: rackId,
        rackDegree: finalDegree,
        sides: {
          left: { ...sides.left },
          right: { ...sides.right }
        }
      };
      console.log('Sending rack rotation update:', updateData);
      onUpdate(updateData);
    }
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
      {hiddenSide === 'left' ? (
        <SimplePlane side="left" />
      ) : (
      <RackSide
        position={[0, 0, 0]}
        size={size}
        shelvesCount={sides.left.shelves.length}
        slotsPerShelf={sides.left.shelves.map(shelf => shelf.slots.length)}
        shelfColors={leftShelfColors}
        slotColors={leftSlotColors[Math.min(sides.left.shelves.length - 1, 5)]}
        isRightSide={false}
        onShelfSelect={(index) => handleShelfSelect('left', index)}
        selectedShelfIndex={selectedShelf.side === 'left' ? selectedShelf.index : -1}
        rackId={rackId}
        shelves={sides.left.shelves}
        side="L"
        onSlotUpdate={handleSlotUpdate}
      />
      )}

      {/* Right Side */}
      {hiddenSide === 'right' ? (
        <SimplePlane side="right" />
      ) : (
      <RackSide
        position={[0, 0, 0]}
        size={size}
        shelvesCount={sides.right.shelves.length}
        slotsPerShelf={sides.right.shelves.map(shelf => shelf.slots.length)}
        shelfColors={rightShelfColors}
        slotColors={rightSlotColors[Math.min(sides.right.shelves.length - 1, 5)]}
        isRightSide={true}
        onShelfSelect={(index) => handleShelfSelect('right', index)}
        selectedShelfIndex={selectedShelf.side === 'right' ? selectedShelf.index : -1}
        rackId={rackId}
        shelves={sides.right.shelves}
        side="R"
        onSlotUpdate={handleSlotUpdate}
      />
      )}

      {/* Control Panel on Top */}
      <group position={[0, size.height + 0.3, 0]}>
        {/* Left Side Controls */}
        <group position={[-0.8, 0, 0]}>
          <ControlButton
            position={[0.62, 0.10, 0]}
            label={hiddenSide === 'left' ? 'L-Show' : 'L-Hide'}
            onClick={(e) => {
              e.stopPropagation();
              const newHiddenSide = hiddenSide === 'left' ? null : 'left';
              setHiddenSide(newHiddenSide);
              handleRackTypeChange(newHiddenSide === 'left' ? 'r-rack' : 'd-rack');
            }}
            color={hiddenSide === 'left' ? '#ff4444' : '#4CAF50'}
            labelColor="black"
          />
        </group>

        {/* Right Side Controls */}
        <group position={[0.8, 0, 0]}>
          <ControlButton
            position={[-0.62, 0.10, 0]}
            label={hiddenSide === 'right' ? 'R-Show' : 'R-Hide'}
            onClick={(e) => {
              e.stopPropagation();
              const newHiddenSide = hiddenSide === 'right' ? null : 'right';
              setHiddenSide(newHiddenSide);
              handleRackTypeChange(newHiddenSide === 'right' ? 'l-rack' : 'd-rack');
            }}
            color={hiddenSide === 'right' ? '#ff4444' : '#4CAF50'}
            labelColor="black"
          />
        </group>

        {/* Left Side Controls - Only show if not hidden */}
        {hiddenSide !== 'left' && (
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
                {sides.left.shelves.length}
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
                  Slots: {sides.left.shelves[selectedShelf.index].slots.length}
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
        )}

        {/* Right Side Controls - Only show if not hidden */}
        {hiddenSide !== 'right' && (
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
                {sides.right.shelves.length}
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
                  Slots: {sides.right.shelves[selectedShelf.index].slots.length}
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
        )}
      </group>
    </group>
  );
};

export default DoubleRack;
