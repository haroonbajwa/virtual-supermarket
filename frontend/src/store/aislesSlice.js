import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    {
      id: 0,
      position: [0, 0, 0],
      aisleDegree: 360,
      racks: Array.from({ length: 3 }, (_, index) => ({
        id: `A0-R${index + 1}`,
        position: [index * 3, 0, 0],
        rackType: 'd-rack',
        sides: {
          left: {
            id: `A0-R${index + 1}-L`,
            shelvesCount: 4,
            slotsPerShelf: [3, 3, 3, 3],
            shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
              id: `A0-R${index + 1}-L-SH${shelfIndex + 1}`,
              slots: Array.from({ length: 3 }, (_, slotIndex) => {
                const slotId = `A0-R${index + 1}-L-SH${shelfIndex + 1}-S${slotIndex + 1}`;
                return {
                  id: slotId,
                  productId: `P${Math.floor(Math.random() * 1000)}`,
                  productName: `Product ${Math.floor(Math.random() * 100)}`,
                  description: `Description for product in slot ${slotId}`,
                  price: (Math.random() * 100).toFixed(2),
                  quantity: Math.floor(Math.random() * 50)
                };
              })
            }))
          },
          right: {
            id: `A0-R${index + 1}-R`,
            shelvesCount: 4,
            slotsPerShelf: [3, 3, 3, 3],
            shelves: Array.from({ length: 4 }, (_, shelfIndex) => ({
              id: `A0-R${index + 1}-R-SH${shelfIndex + 1}`,
              slots: Array.from({ length: 3 }, (_, slotIndex) => {
                const slotId = `A0-R${index + 1}-R-SH${shelfIndex + 1}-S${slotIndex + 1}`;
                return {
                  id: slotId,
                  productId: `P${Math.floor(Math.random() * 1000)}`,
                  productName: `Product ${Math.floor(Math.random() * 100)}`,
                  description: `Description for product in slot ${slotId}`,
                  price: (Math.random() * 100).toFixed(2),
                  quantity: Math.floor(Math.random() * 50)
                };
              })
            }))
          }
        },
        size: { width: 2, depth: 1, height: 3 },
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      }))
    }
  ]
};

export const aislesSlice = createSlice({
  name: 'aisles',
  initialState,
  reducers: {
    setAisles: (state, action) => {
      state.items = action.payload;
    },
    addAisle: (state, action) => {
      state.items.push(action.payload);
    },
    updateAisle: (state, action) => {
      const index = state.items.findIndex(aisle => aisle.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeAisle: (state, action) => {
      state.items = state.items.filter(aisle => aisle.id !== action.payload);
    }
  }
});

export const { setAisles, addAisle, updateAisle, removeAisle } = aislesSlice.actions;
export const selectAisles = (state) => state.aisles.items;
export default aislesSlice.reducer;
