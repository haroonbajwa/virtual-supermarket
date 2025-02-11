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

const ProductBox = ({ 
  position, 
  size = [0.3, 0.3, 0.3], 
  category,
  variant,
  rotation = 0
}) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box args={size}>
        <meshStandardMaterial 
          color={variant.color} 
          roughness={0.6}
          metalness={0.2}
        />
      </Box>
      <Text
        position={[0, size[1] + 0.05, 0]}
        fontSize={0.05}
        color={variant.color}
        anchorX="center"
        anchorY="bottom"
        rotation={[0, rotation, 0]}
      >
        {variant.name}
      </Text>
    </group>
  );
};

const Rack = ({ 
  position = [0, 0, 0], 
  size = { width: 2, depth: 1, height: 3 }, 
  shelves = 3, 
  color = '#455A64',
  onUpdateShelves 
}) => {
  const [productPlacement, setProductPlacement] = useState([]);
  const [boxesPerRow, setBoxesPerRow] = useState(3);

  // Initialize product placement when component mounts or updates
  useEffect(() => {
    const generateProductPlacement = () => {
      const newProductPlacement = [];

      for (let shelf = 0; shelf < shelves; shelf++) {
        const shelfProducts = [];

        // Randomly select a category for the shelf
        const category = productCategories[Math.floor(Math.random() * productCategories.length)];

        // Calculate spacing between boxes
        const boxSpacingX = size.width / (boxesPerRow + 1);

        for (let row = 0; row < boxesPerRow; row++) {
          // Randomly select a variant from the category
          const variant = category.variants[Math.floor(Math.random() * category.variants.length)];

          // Left side product placement
          shelfProducts.push({
            leftSide: {
              position: [
                -(size.width / 2 - boxSpacingX * (row + 1)),
                shelf * (size.height / shelves) + (size.height / shelves / 2),
                -(size.depth / 2 + 0.2)
              ],
              rotation: 0  // Facing forward
            },
            // Right side product placement
            rightSide: {
              position: [
                -(size.width / 2 - boxSpacingX * (row + 1)),
                shelf * (size.height / shelves) + (size.height / shelves / 2),
                size.depth / 2 + 0.2
              ],
              rotation: Math.PI  // Facing backward
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
  }, [shelves, boxesPerRow, size]);

  // Keyboard controls for adding/removing boxes
  const handleKeyDown = (e) => {
    if (e.key === 'b' || e.key === 'B') {
      if (e.shiftKey && boxesPerRow < 5) {
        setBoxesPerRow(prev => prev + 1);
      } else if (e.ctrlKey && boxesPerRow > 1) {
        setBoxesPerRow(prev => prev - 1);
      }
    }
  };

  // Add event listener for keyboard controls
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <group position={position}>
      {/* Rack Structure */}
      <Box 
        args={[size.width, size.height, size.depth]} 
        position={[0, size.height / 2, 0]}
      >
        <meshStandardMaterial 
          color={color} 
          roughness={0.7}
          metalness={0.3}
        />
      </Box>

      {/* Shelves */}
      {[...Array(shelves - 1)].map((_, index) => (
        <Box 
          key={`shelf-${index}`}
          args={[size.width, 0.05, size.depth]} 
          position={[0, (index + 1) * (size.height / shelves), 0]}
        >
          <meshStandardMaterial 
            color={color} 
            roughness={0.8}
            metalness={0.2}
            opacity={0.6}
            transparent
          />
        </Box>
      ))}

      {/* Product Boxes */}
      <group>
        {productPlacement.map((shelfProducts, shelfIndex) => (
          <React.Fragment key={`shelf-${shelfIndex}`}>
            {shelfProducts.map((product, boxIndex) => (
              <React.Fragment key={`shelf${shelfIndex}-box${boxIndex}`}>
                {/* Left Side Product Box */}
                <ProductBox 
                  position={product.leftSide.position}
                  rotation={product.leftSide.rotation}
                  category={product.category}
                  variant={product.variant}
                />
                
                {/* Right Side Product Box */}
                <ProductBox 
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

      {/* Shelf Control Text */}
      <Text
        position={[size.width / 2 + 0.5, size.height / 2, 0]}
        fontSize={0.2}
        color={color}
        anchorX="left"
        anchorY="middle"
      >
        {`Shelves: ${shelves}`}
      </Text>

      {/* Boxes Control Text */}
      <Text
        position={[size.width / 2 + 0.5, size.height / 2 - 0.3, 0]}
        fontSize={0.2}
        color={color}
        anchorX="left"
        anchorY="middle"
      >
        {`Boxes/Row: ${boxesPerRow}`}
      </Text>

      {/* Shelf Controls */}
      <group position={[size.width / 2 + 0.5, size.height / 2 + 0.5, 0]}>
        {/* Add Shelf */}
        <group onClick={(e) => {
          e.stopPropagation();
          if (shelves < 6) onUpdateShelves(shelves + 1);
        }}>
          <Box args={[0.3, 0.2, 0.1]}>
            <meshStandardMaterial color="#4CAF50" roughness={0.5} metalness={0.2} />
          </Box>
          <Text 
            position={[0, 0, 0.06]} 
            scale={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            +
          </Text>
        </group>

        {/* Remove Shelf */}
        {shelves > 1 && (
          <group 
            position={[0.4, 0, 0]} 
            onClick={(e) => {
              e.stopPropagation();
              onUpdateShelves(shelves - 1);
            }}
          >
            <Box args={[0.3, 0.2, 0.1]}>
              <meshStandardMaterial color="#f44336" roughness={0.5} metalness={0.2} />
            </Box>
            <Text 
              position={[0, 0, 0.06]} 
              scale={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              -
            </Text>
          </group>
        )}
      </group>
    </group>
  );
};

export default Rack;
