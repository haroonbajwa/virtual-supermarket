import axios from 'axios';

const API_URL = 'http://localhost:5000/api/layouts';

export const layoutService = {
    getAllLayouts: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching layouts:', error);
            throw error;
        }
    },

    getLayout: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching layout:', error);
            throw error;
        }
    },

    saveLayout: async (layoutData) => {
        try {
            const response = await axios.post(API_URL, layoutData);
            return response.data;
        } catch (error) {
            console.error('Error saving layout:', error);
            throw error;
        }
    },

    updateLayout: async (id, layoutData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, layoutData);
            return response.data;
        } catch (error) {
            console.error('Error updating layout:', error);
            throw error;
        }
    },

    deleteLayout: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting layout:', error);
            throw error;
        }
    }
};
