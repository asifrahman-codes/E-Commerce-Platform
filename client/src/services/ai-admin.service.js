
import api from "./api";
import API_ENDPOINTS from "./endpoints";

const aiAdminService = {

    getInventoryInsights: async () => {

        return api.get(
            API_ENDPOINTS.AI_ADMIN.INVENTORY_INSIGHTS
        );

    },

    chat: async (message, history = []) => {

        return api.post(
            API_ENDPOINTS.AI_ADMIN.CHAT,
            {
                message,
                history,
            }
        );

    },

    generateContent: async (payload) => {

        return api.post(
            API_ENDPOINTS.AI_ADMIN.GENERATE_CONTENT,
            payload
        );

    },

};

export default aiAdminService;
