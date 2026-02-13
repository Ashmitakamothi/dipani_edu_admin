import { AppDispatch } from "../store/index";
import { fetchCertificatePdf } from "../store/slices/certificate";
import axiosInstance from "../services/axiosConfig";

/**
 * Downloads a certificate PDF by certificate ID
 * @param dispatch - Redux dispatch function
 * @param certificateId - The certificate ID to download
 * @param fileName - Optional custom file name (default: "certificate.pdf")
 */
export const downloadCertificateById = async (
  dispatch: AppDispatch,
  certificateId: string,
  fileName: string = "certificate.pdf"
): Promise<void> => {
  try {
    if (!certificateId) {
      alert("Certificate ID is missing");
      return;
    }

    console.log("Downloading certificate with ID:", certificateId);

    // First, try the PDF download endpoint
    try {
      const resultAction = await dispatch(
        fetchCertificatePdf({ certificateId })
      );

      console.log("Download result action:", resultAction);

      if (fetchCertificatePdf.fulfilled.match(resultAction)) {
        const blob = resultAction.payload;
        console.log("Received blob:", blob, "Type:", blob?.type, "Size:", blob?.size);
        
        if (blob && blob instanceof Blob) {
          // Check if blob is empty
          if (blob.size === 0) {
            throw new Error("Certificate file is empty");
          }

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          console.log("Certificate downloaded successfully");
          return;
        }
      } else if (fetchCertificatePdf.rejected.match(resultAction)) {
        const error = resultAction.payload as string;
        console.warn("PDF download endpoint failed, trying view endpoint:", error);
        // Fall through to use view endpoint
      }
    } catch (pdfError: any) {
      console.warn("PDF download endpoint error, trying view endpoint:", pdfError);
      // Fall through to use view endpoint
    }

    // Fallback: Use the view endpoint which generates PDF dynamically
    console.log("Using view endpoint to generate PDF dynamically");
    try {
      const response = await axiosInstance.get(
        `/certificates/${certificateId}/view`,
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/pdf",
          },
        }
      );

      const blob = response.data;
      if (blob && blob instanceof Blob && blob.size > 0) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        console.log("Certificate downloaded successfully via view endpoint");
      } else {
        throw new Error("Invalid or empty certificate file received");
      }
    } catch (viewError: any) {
      console.error("View endpoint also failed:", viewError);
      alert(
        viewError.response?.data?.message || 
        viewError.message || 
        "Failed to download certificate. The certificate PDF is not available."
      );
    }
  } catch (error: any) {
    console.error("Download certificate error:", error);
    console.error("Error stack:", error.stack);
    alert(
      error.response?.data?.message || 
      error.message || 
      "Download failed. Please try again."
    );
  }
};

/**
 * Fetches certificate ID by user ID and course ID, then downloads it
 * @param dispatch - Redux dispatch function
 * @param userId - The user/student ID
 * @param courseId - The course ID
 * @param fileName - Optional custom file name (default: "certificate.pdf")
 */
export const downloadCertificateByUserAndCourse = async (
  dispatch: AppDispatch,
  userId: string,
  courseId: string,
  fileName: string = "certificate.pdf"
): Promise<void> => {
  try {
    console.log("Fetching certificate for userId:", userId, "courseId:", courseId);
    
    // First, find the certificate by user_id (backend doesn't filter by course_id in query)
    const response = await axiosInstance.get(
      `/certificates?user_id=${userId}`
    );

    console.log("Certificate API response:", response.data);

    // Handle different response structures
    let certificates = null;
    if (response.data?.data) {
      // Response structure: { success: true, data: [...] }
      certificates = Array.isArray(response.data.data) 
        ? response.data.data 
        : (response.data.data?.certificates || response.data.data?.data || []);
    } else if (Array.isArray(response.data)) {
      // Response is directly an array
      certificates = response.data;
    } else {
      certificates = [];
    }
    
    console.log("Extracted certificates:", certificates);
    
    if (!certificates || certificates.length === 0) {
      alert("No certificate found for this user.");
      return;
    }

    // Filter by course_id on client side if needed
    let matchingCertificate = certificates.find(
      (cert: any) => 
        (cert.course_id?._id?.toString() === courseId) ||
        (cert.course_id?.toString() === courseId) ||
        (cert.courseId?.toString() === courseId) ||
        (cert.course_id === courseId)
    );

    // If no match found, use the first certificate (fallback)
    if (!matchingCertificate && certificates.length > 0) {
      console.warn("No certificate found for specific course, using first available certificate");
      matchingCertificate = certificates[0];
    }

    if (!matchingCertificate) {
      alert("No certificate found for this course.");
      return;
    }

    // Get the certificate ID
    const certificateId = matchingCertificate._id || matchingCertificate.id;
    
    console.log("Certificate ID to download:", certificateId);
    
    if (!certificateId) {
      console.error("Certificate object:", matchingCertificate);
      alert("Certificate ID not found in certificate object.");
      return;
    }

    // Download the certificate
    await downloadCertificateById(dispatch, certificateId, fileName);
  } catch (error: any) {
    console.error("Error fetching certificate:", error);
    console.error("Error details:", error.response?.data || error.message);
    alert(
      error.response?.data?.message || 
      error.message || 
      "Failed to find certificate. Please try again."
    );
  }
};

