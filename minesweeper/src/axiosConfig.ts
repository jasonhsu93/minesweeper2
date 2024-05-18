import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:5000/', // Your API base URL
  withCredentials: true,
});

export default axiosInstance;
