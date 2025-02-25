// Movement functions for rack
export const moveRack = (currentPosition, direction, distance = 0.5) => {
  switch (direction) {
    case 'up':
      return [
        currentPosition[0],
        currentPosition[1],
        currentPosition[2] - distance
      ];
    case 'down':
      return [
        currentPosition[0],
        currentPosition[1],
        currentPosition[2] + distance
      ];
    case 'left':
      return [
        currentPosition[0] - distance,
        currentPosition[1],
        currentPosition[2]
      ];
    case 'right':
      return [
        currentPosition[0] + distance,
        currentPosition[1],
        currentPosition[2]
      ];
    default:
      return currentPosition;
  }
};

// Rotation function for rack
export const rotateRack = (currentRotation) => {
  // Add 90 degrees (π/2 radians) to current rotation
  const newRotation = currentRotation + Math.PI / 2;
  // Normalize rotation to keep it between 0 and 2π
  return newRotation % (Math.PI * 2);
};