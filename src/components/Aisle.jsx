import React, { useState } from 'react';
import { Text, Box } from '@react-three/drei';
import Rack from './Rack';

const Aisle = ({ position, initialRackCount = 2, rackSpacing = 3 }) => {
  const [racks, setRacks] = useState(
    Array.from({ length: initialRackCount }, (_, index) => ({
      id: index,
      shelves: 3,
      size: { width: 2, depth: 1, height: 3 },
      color: '#455A64'
    }))
  );

  const addRack = () => {
    setRacks(prevRacks => [
      ...prevRacks, 
      { 
        id: prevRacks.length, 
        shelves: 3,
        size: { width: 2, depth: 1, height: 3 },
        color: '#455A64'
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

  return (
    <group position={position}>
      {/* Aisle Number */}
      <group position={[racks.length * rackSpacing / 2, 4.5, 0]}>
        <Box 
          args={[1.5, 0.8, 0.1]} 
          position={[0, 0, -0.05]}
        >
          <meshPhysicalMaterial
            color="#2196F3"
            metalness={0.5}
            roughness={0.4}
            clearcoat={0.5}
            envMapIntensity={1}
          />
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
        <meshStandardMaterial 
          color="#37474F"
          metalness={0.2}
          roughness={0.8}
          opacity={0.3}
          transparent
        />
      </mesh>

      {/* Racks */}
      <group>
        {racks.map((rack, index) => (
          <Rack 
            key={rack.id}
            position={[index * rackSpacing, 0, 0]} 
            size={rack.size}
            shelves={rack.shelves}
            color={rack.color}
            onUpdateShelves={(newShelfCount) => updateRackShelves(index, newShelfCount)}
          />
        ))}
      </group>
      
      {/* Rack Controls */}
      <group position={[racks.length * rackSpacing + 1, 2, 0]}>
        {/* Add Rack Button */}
        <group position={[-0.5, 0, 0]} onClick={addRack}>
          <Box 
            args={[0.8, 0.4, 0.1]}
          >
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
        
        {/* Remove Rack Button */}
        {racks.length > 1 && (
          <group position={[0.5, 0, 0]} onClick={removeRack}>
            <Box 
              args={[0.8, 0.4, 0.1]}
            >
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

export default Aisle;
