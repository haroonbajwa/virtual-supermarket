import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  AccumulativeShadows,
  RandomizedLight,
  Loader,
  Box
} from '@react-three/drei';
import Aisle from './Aisle';

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
      background: 'linear-gradient(to bottom, #37474F, #263238)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)'
      }}>
        <h2 style={{ 
          margin: '0 0 15px 0',
          color: '#37474F',
          borderBottom: '2px solid #4CAF50',
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
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(76,175,80,0.3)'
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
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(244,67,54,0.3)'
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
          color: '#455A64',
          lineHeight: '1.6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4CAF50' }}></div>
            Click + or - above racks to modify shelves
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2196F3' }}></div>
            Use buttons to add/remove racks in aisles
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFC107' }}></div>
            Drag to rotate, scroll to zoom
          </div>
        </div>
      </div>

      <Canvas 
        shadows="soft"
        camera={{ position: [15, 15, 15], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #37474F, #263238)' }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#37474F', 30, 50]} />
          
          <PerspectiveCamera makeDefault position={[15, 15, 15]} />
          <OrbitControls 
            target={[5, 0, 5]} 
            maxPolarAngle={Math.PI / 2.1}
            enableDamping
            dampingFactor={0.05}
          />
          
          {/* Environment and Lighting */}
          <Environment preset="warehouse" background blur={0.8} />
          
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <spotLight
            position={[-10, 10, -5]}
            intensity={0.5}
            angle={0.5}
            penumbra={0.5}
            castShadow
          />

          {/* Floor */}
          <group>
            {/* Main Floor */}
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -0.5, 0]} 
              receiveShadow
            >
              <planeGeometry args={[100, 100]} />
              <meshPhysicalMaterial 
                color="#455A64"
                metalness={0.2}
                roughness={0.8}
                clearcoat={0.3}
                clearcoatRoughness={0.3}
                envMapIntensity={0.5}
              />
            </mesh>

            {/* Floor Pattern */}
            <gridHelper 
              args={[100, 100, '#78909C', '#546E7A']} 
              position={[0, -0.49, 0]}
            />
          </group>

          {/* Walls */}
          <Box args={[100, 20, 1]} position={[0, 9.5, -50]}>
            <meshStandardMaterial color="#37474F" />
          </Box>
          <Box args={[1, 20, 100]} position={[-50, 9.5, 0]}>
            <meshStandardMaterial color="#37474F" />
          </Box>
          <Box args={[1, 20, 100]} position={[50, 9.5, 0]}>
            <meshStandardMaterial color="#37474F" />
          </Box>

          {/* Aisles */}
          {aisles.map((aisle) => (
            <Aisle
              key={aisle.id}
              position={aisle.position}
              initialRackCount={3}
              rackSpacing={3}
            />
          ))}

          {/* Shadows */}
          <AccumulativeShadows
            temporal
            frames={100}
            alphaTest={0.85}
            opacity={0.8}
            scale={100}
            position={[0, -0.49, 0]}
          >
            <RandomizedLight
              amount={8}
              radius={10}
              ambient={0.5}
              intensity={1}
              position={[5, 5, -10]}
              bias={0.001}
            />
          </AccumulativeShadows>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Store;
