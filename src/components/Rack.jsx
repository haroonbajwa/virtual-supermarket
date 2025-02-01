import React from 'react';
import { Text, Cylinder, Box } from '@react-three/drei';

const Rack = ({ position, size, shelves, color = '#455A64', onUpdateShelves }) => {
  const { width = 2, depth = 1, height = 3 } = size;
  const poleRadius = 0.05;
  const shelfThickness = 0.05;
  const bracketDepth = depth + 0.1;

  const handleAddShelf = (e) => {
    e.stopPropagation();
    if (shelves < 5) {
      onUpdateShelves(shelves + 1);
    }
  };

  const handleRemoveShelf = (e) => {
    e.stopPropagation();
    if (shelves > 1) {
      onUpdateShelves(shelves - 1);
    }
  };

  return (
    <group position={position}>
      {/* Vertical Support Poles */}
      {[
        [-width/2, 0, -depth/2],
        [width/2, 0, -depth/2],
        [-width/2, 0, depth/2],
        [width/2, 0, depth/2]
      ].map((pos, index) => (
        <Cylinder
          key={index}
          args={[poleRadius, poleRadius, height, 8]}
          position={[pos[0], height/2, pos[2]]}
        >
          <meshPhysicalMaterial
            color="#455A64"
            metalness={0.8}
            roughness={0.2}
            clearcoat={0.5}
            envMapIntensity={1}
          />
        </Cylinder>
      ))}

      {/* Shelves */}
      {Array.from({ length: shelves }).map((_, index) => {
        const shelfHeight = (height / (shelves + 1)) * (index + 1);
        return (
          <group key={index} position={[0, shelfHeight, 0]}>
            {/* Main Shelf */}
            <Box
              args={[width, shelfThickness, depth]}
            >
              <meshPhysicalMaterial
                color={color}
                metalness={0.5}
                roughness={0.4}
                clearcoat={0.3}
                envMapIntensity={0.8}
              />
            </Box>

            {/* Shelf Brackets */}
            {[[-width/2, 0], [width/2, 0]].map((pos, i) => (
              <Box
                key={i}
                args={[0.1, 0.1, bracketDepth]}
                position={[pos[0], 0, 0]}
              >
                <meshPhysicalMaterial
                  color="#37474F"
                  metalness={0.7}
                  roughness={0.3}
                  clearcoat={0.5}
                  envMapIntensity={1}
                />
              </Box>
            ))}
          </group>
        );
      })}

      {/* Shelf Controls */}
      <group position={[0, height + 0.5, 0]}>
        {/* Add Shelf Button */}
        {shelves < 5 && (
          <group position={[-0.3, 0, 0]} onClick={handleAddShelf}>
            <Box args={[0.4, 0.4, 0.1]}>
              <meshPhysicalMaterial
                color="#4CAF50"
                metalness={0.5}
                roughness={0.4}
                clearcoat={0.5}
                envMapIntensity={1}
              />
            </Box>
            <Text
              position={[0, 0, 0.06]}
              scale={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
              characters="+"
            >
              +
            </Text>
          </group>
        )}

        {/* Remove Shelf Button */}
        {shelves > 1 && (
          <group position={[0.3, 0, 0]} onClick={handleRemoveShelf}>
            <Box args={[0.4, 0.4, 0.1]}>
              <meshPhysicalMaterial
                color="#f44336"
                metalness={0.5}
                roughness={0.4}
                clearcoat={0.5}
                envMapIntensity={1}
              />
            </Box>
            <Text
              position={[0, 0, 0.06]}
              scale={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
              characters="-"
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
