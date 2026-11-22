import api from "./api";
import API_ENDPOINTS from "./endpoints";

const aiAssistantService = {
  async sendMessage(payload) {
    return api.post(
      API_ENDPOINTS.AI.ASSISTANT,
      payload
    );
  },
};

export default aiAssistantService;