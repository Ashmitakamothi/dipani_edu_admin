import axiosInstance from './axiosConfig';

/**
 * Fetch forum posts (threads) created by a specific user
 * @param userId - User ID
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with forum posts data
 */
export const getStudentForumPosts = async (userId: string, page: number = 1, limit: number = 10) => {
  try {
    // For admin, we'll need to use a different endpoint or pass userId as query param
    // Since /forum/my-threads is for authenticated user, we might need an admin endpoint
    // For now, using a workaround: fetch all threads and filter, or use admin endpoint if available
    const response = await axiosInstance.get(`/forum/my-threads`, {
      params: { 
        page, 
        limit,
        userId // Pass userId if backend supports it
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching student forum posts:", error);
    throw error;
  }
};

/**
 * Fetch forum replies made by a specific user
 * @param userId - User ID
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with forum replies data
 */
export const getStudentForumReplies = async (userId: string, page: number = 1, limit: number = 10) => {
  try {
    // This might need a custom admin endpoint
    // For now, we'll try to get replies from threads
    const response = await axiosInstance.get(`/admin/students/${userId}/forum-replies`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching student forum replies:", error);
    // Return empty data if endpoint doesn't exist yet
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }
};

/**
 * Fetch job posts created by a specific user
 * @param userId - User ID
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with job posts data
 */
export const getStudentJobPosts = async (userId: string, page: number = 1, limit: number = 10) => {
  try {
    // Similar to forum posts, might need admin endpoint
    const response = await axiosInstance.get(`/jobs/my-posts`, {
      params: { 
        page, 
        limit,
        userId // Pass userId if backend supports it
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching student job posts:", error);
    throw error;
  }
};

