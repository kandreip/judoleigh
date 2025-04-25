// const API_URL = 'http://localhost:3001/api';
const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api'
    : 'http://13.41.184.180:3001/api';
// const API_URL = 'http://ao-tech.co.uk/api'; // Production URL
// const API_URL = 'http://13.41.184.180/api'; // Alternative IP-based URL

export default API_URL; 