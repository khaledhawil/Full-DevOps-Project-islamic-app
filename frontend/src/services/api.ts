import axios from 'axios';

// Use relative URL so it works from any domain/port
// This will automatically use the same host and port as the frontend
const baseURL = '/api';

axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Export the base URL for direct fetch usage
export const API_BASE_URL = baseURL;

export default axios;
