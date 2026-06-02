import { useState, useCallback } from 'react';

export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      
      // Axios trả về dữ liệu trong response.data
      // Backend của bạn bọc kết quả lại trong { success: true, data: ... }
      const resData = response.data || response;
      const finalData = resData.data !== undefined ? resData.data : resData;
      
      setData(finalData);
      return finalData;
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi kết nối máy chủ.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, loading, error, execute, setData, setError };
};
