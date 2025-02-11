import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Box
} from '@react-three/drei';
import Aisle from './Aisle';

// Realistic color palette
const colors = {
  background: '#F5F5F5',
  floor: '#E0E0E0',
  walls: '#BDBDBD',
  accent: [
    '#616161',   // Dark Gray
    '#424242',   // Darker Gray
    '#212121',   // Almost Black
  ]
};

const Store = () => {
  const [aisles, setAisles] = useState([
    { id: 0, position: [0, 0, 0] },
    { id: 1, position: [0, 0, 5] },
  ]);

  const addAisle = () => {
    setAisles(prevAisles => [
      ...prevAisles,
      {
        id: prevAisles.length,
        position: [0, 0, (prevAisles.length) * 5]
      }
    ]);
  };

  const removeAisle = () => {
    if (aisles.length > 1) {
      setAisles(prevAisles => prevAisles.slice(0, -1));
    }
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      background: colors.background,
      fontFamily: 'Roboto, Arial, sans-serif'
    }}>
      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ 
          margin: '0 0 15px 0',
          color: colors.accent[0],
          borderBottom: `2px solid ${colors.accent[1]}`,
          paddingBottom: '10px',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Superstore Layout Designer
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={addAisle}
            style={{
              padding: '12px 24px',
              backgroundColor: colors.accent[1],
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Add Aisle
          </button>
          {aisles.length > 1 && (
            <button 
              onClick={removeAisle}
              style={{
                padding: '12px 24px',
                backgroundColor: colors.accent[2],
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Remove Aisle
            </button>
          )}
        </div>
        <div style={{ 
          marginTop: '20px', 
          fontSize: '14px', 
          color: colors.accent[0],
          lineHeight: '1.6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent[1] }}></div>
            Click rack to configure products
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent[2] }}></div>
            Use B+/B- to adjust product boxes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent[0] }}></div>
            Drag to rotate, scroll to zoom
          </div>
        </div>
      </div>

      <Canvas 
        camera={{ position: [15, 15, 15], fov: 50 }}
        style={{ 
          background: colors.background,
          width: '100%', 
          height: '100%' 
        }}
        gl={{ 
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[15, 15, 15]} />
          <OrbitControls 
            target={[5, 0, 5]} 
            maxPolarAngle={Math.PI / 2.1}
            enableDamping
            dampingFactor={0.05}
          />
          
          {/* Realistic Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.7}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight 
            position={[-10, 10, -10]} 
            intensity={0.3} 
            distance={50} 
          />

          {/* Environment */}
          <Environment preset="warehouse" background />

          {/* Floor */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.5, 0]}
            receiveShadow
          >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial 
              color={colors.floor} 
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>

          {/* Walls */}
          <Box args={[100, 20, 1]} position={[0, 9.5, -50]} receiveShadow>
            <meshStandardMaterial 
              color={colors.walls} 
              roughness={0.7}
              metalness={0.3}
            />
          </Box>
          <Box args={[1, 20, 100]} position={[-50, 9.5, 0]} receiveShadow>
            <meshStandardMaterial 
              color={colors.walls} 
              roughness={0.7}
              metalness={0.3}
            />
          </Box>
          <Box args={[1, 20, 100]} position={[50, 9.5, 0]} receiveShadow>
            <meshStandardMaterial 
              color={colors.walls} 
              roughness={0.7}
              metalness={0.3}
            />
          </Box>

          {/* Aisles */}
          {aisles.map((aisle, index) => (
            <Aisle
              key={aisle.id}
              position={aisle.position}
              initialRackCount={3}
              rackSpacing={3}
              accentColor={colors.accent[index % colors.accent.length]}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Store;
