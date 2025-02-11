import React, { useState, useEffect } from 'react';
import { Box, Text } from '@react-three/drei';

// More realistic product categories
const productCategories = [
  { 
    name: 'Electronics', 
    color: '#607D8B',     // Muted Gray-Blue
    variants: [
      { name: 'Smartphones', color: '#455A64' },
      { name: 'Laptops', color: '#37474F' },
      { name: 'Accessories', color: '#546E7A' }
    ]
  },
  { 
    name: 'Clothing', 
    color: '#5D4037',     // Dark Brown
    variants: [
      { name: 'Shirts', color: '#6D4C41' },
      { name: 'Pants', color: '#4E342E' },
      { name: 'Jackets', color: '#3E2723' }
    ]
  },
  { 
    name: 'Home Goods', 
    color: '#424242',     // Dark Gray
    variants: [
      { name: 'Kitchen', color: '#212121' },
      { name: 'Bedding', color: '#616161' },
      { name: 'Decor', color: '#424242' }
    ]
  }
];

const ProductSlot = ({ 
  position, 
  size = [0.35, 0.4, 0.3],  
  category,
  variant,
  rotation = 0
}) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Product Slot Frame */}
      <Box args={[size[0], size[1], 0.02]} position={[0, 0, size[2]/2]}>
        <meshStandardMaterial 
          color="#2c3e50"
          roughness={0.8}
          metalness={0.2}
        />
      </Box>
      
      {/* Product Display Area */}
      <Box args={[size[0] - 0.05, size[1] - 0.05, size[2] - 0.05]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={variant.color} 
          roughness={0.6}
          metalness={0.1}
        />
      </Box>

      {/* Variant Name Label Directly on Surface */}
      <Text
        position={[0, 0, size[2]/2 + 1]}
        fontSize={0.03}
        color="white"
        anchorX="center"
        anchorY="top"
      >
        {variant.name}
      </Text>

      {/* Category Name Label Directly on Surface */}
      <Text
        position={[0, 0, size[2]/2 + 1]}
        fontSize={0.025}
        color="lightgray"
        anchorX="center"
        anchorY="middle"
      >
        {category.name}
      </Text>
    </group>
  );
};

const ControlButton = ({ position, color, label, onClick }) => (
  <group position={position} onClick={onClick}>
    <Box args={[0.15, 0.15, 0.15]}>
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
    </Box>
    <Text 
      position={[0, 0, 0.08]} 
      scale={0.1}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      {label}
    </Text>
  </group>
);

const ControlPanel = ({ 
  position, 
  shelves, 
  slotsPerRow, 
  onUpdateShelves, 
  onUpdateSlots 
}) => {
  return (
    <group position={position}>
      {/* Control Panel Background */}
      <Box args={[1, 0.2, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#2c3e50" 
          roughness={0.7} 
          metalness={0.2}
        />
      </Box>

      {/* Shelf Controls */}
      <group position={[-0.25, 0, 0.08]}>
        <Text 
          position={[0, 0.15, 0]} 
          scale={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Shelves: {shelves}
        </Text>
        <ControlButton
          position={[-0.1, 0, 0]}
          color="#e74c3c"
          label="-"
          onClick={(e) => {
            e.stopPropagation();
            if (shelves > 1) onUpdateShelves(shelves - 1);
          }}
        />
        <ControlButton
          position={[0.1, 0, 0]}
          color="#2ecc71"
          label="+"
          onClick={(e) => {
            e.stopPropagation();
            if (shelves < 6) onUpdateShelves(shelves + 1);
          }}
        />
      </group>

      {/* Slots Controls */}
      <group position={[0.25, 0, 0.08]}>
        <Text 
          position={[0, 0.15, 0]} 
          scale={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Slots: {slotsPerRow}
        </Text>
        <ControlButton
          position={[-0.1, 0, 0]}
          color="#e74c3c"
          label="-"
          onClick={(e) => {
            e.stopPropagation();
            if (slotsPerRow > 1) onUpdateSlots(slotsPerRow - 1);
          }}
        />
        <ControlButton
          position={[0.1, 0, 0]}
          color="#2ecc71"
          label="+"
          onClick={(e) => {
            e.stopPropagation();
            if (slotsPerRow < 5) onUpdateSlots(slotsPerRow + 1);
          }}
        />
      </group>
    </group>
  );
};

const Rack = ({ 
  position = [0, 0, 0], 
  size = { width: 2, depth: 1, height: 3 }, 
  shelves = 3, 
  color = '#34495e',
  onUpdateShelves 
}) => {
  const [productPlacement, setProductPlacement] = useState([]);
  const [slotsPerRow, setSlotsPerRow] = useState(3);

  useEffect(() => {
    const generateProductPlacement = () => {
      const newProductPlacement = [];
      const slotWidth = 0.35; 
      const margin = 0.05; 

      for (let shelf = 0; shelf < shelves; shelf++) {
        const shelfProducts = [];
        const category = productCategories[Math.floor(Math.random() * productCategories.length)];
        
        const totalSlotsWidth = slotsPerRow * slotWidth;
        const remainingSpace = size.width - totalSlotsWidth;
        const gap = remainingSpace / (slotsPerRow + 1);
        
        const shelfHeight = size.height / shelves;
        const shelfY = shelf * shelfHeight + shelfHeight / 2;

        for (let row = 0; row < slotsPerRow; row++) {
          const variant = category.variants[Math.floor(Math.random() * category.variants.length)];
          
          const xPosition = -(size.width / 2) + gap + (row * (slotWidth + gap));

          shelfProducts.push({
            leftSide: {
              position: [
                xPosition + slotWidth/2,
                shelfY,
                -(size.depth / 2)
              ],
              rotation: 0
            },
            rightSide: {
              position: [
                xPosition + slotWidth/2,
                shelfY,
                size.depth / 2
              ],
              rotation: Math.PI
            },
            category,
            variant
          });
        }

        newProductPlacement.push(shelfProducts);
      }

      setProductPlacement(newProductPlacement);
    };

    generateProductPlacement();
  }, [shelves, slotsPerRow, size]);

  const handleKeyDown = (e) => {
    if (e.key === 'b' || e.key === 'B') {
      if (e.shiftKey && slotsPerRow < 5) {
        setSlotsPerRow(prev => prev + 1);
      } else if (e.ctrlKey && slotsPerRow > 1) {
        setSlotsPerRow(prev => prev - 1);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <group position={position}>
      {/* Main Rack Structure */}
      <Box 
        args={[size.width, size.height, size.depth]} 
        position={[0, size.height / 2, 0]}
      >
        <meshStandardMaterial 
          color={color} 
          roughness={0.7}
          metalness={0.2}
        />
      </Box>

      {/* Vertical Supports */}
      {[...Array(2)].map((_, i) => (
        <Box 
          key={`vertical-support-${i}`}
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

      {/* Shelf Dividers */}
      {[...Array(shelves - 1)].map((_, index) => (
        <Box 
          key={`shelf-${index}`}
          args={[size.width - 0.1, 0.05, size.depth]} 
          position={[0, (index + 1) * (size.height / shelves), 0]}
        >
          <meshStandardMaterial 
            color={color} 
            roughness={0.8}
            metalness={0.2}
          />
        </Box>
      ))}

      {/* Product Slots */}
      <group>
        {productPlacement.map((shelfProducts, shelfIndex) => (
          <React.Fragment key={`shelf-${shelfIndex}`}>
            {shelfProducts.map((product, slotIndex) => (
              <React.Fragment key={`shelf${shelfIndex}-slot${slotIndex}`}>
                <ProductSlot 
                  position={product.leftSide.position}
                  rotation={product.leftSide.rotation}
                  category={product.category}
                  variant={product.variant}
                />
                <ProductSlot 
                  position={product.rightSide.position}
                  rotation={product.rightSide.rotation}
                  category={product.category}
                  variant={product.variant}
                />
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </group>

      {/* Control Panel */}
      <ControlPanel 
        position={[0, size.height + 0.2, 0]}
        shelves={shelves}
        slotsPerRow={slotsPerRow}
        onUpdateShelves={onUpdateShelves}
        onUpdateSlots={setSlotsPerRow}
      />
    </group>
  );
};

export default Rack;
