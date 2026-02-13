// import React, { useRef, useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import PopupAlert from "../../components/popUpAlert";
// import { BookOpen } from "lucide-react";
// import { motion } from "framer-motion";

// const CreateCertificateTemplate = () => {
//   const dispatch = useDispatch();
//   const containerRef = useRef(null);
//   const [isContainerReady, setIsContainerReady] = useState(false);

//   useEffect(() => {
//     if (containerRef.current) setIsContainerReady(true);
//   }, []);

//   const [title, setTitle] = useState({
//     title: "This certificate awarded to [student]",
//     fontSize: 24,
//     fontColor: "#000",
//     position: { x: 180, y: 250 },
//   });

//   const [body, setBody] = useState({
//     content: "regarding completing [course]",
//     fontSize: 16,
//     fontColor: "#000",
//     position: { x: 250, y: 300 },
//   });

//   const [signature, setSignature] = useState(null);
//   const [stamp, setStamp] = useState(null);
//   const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
//   const [stampPosition, setStampPosition] = useState({ x: 0, y: 0 });

//   const [backgroundImage, setBackgroundImage] = useState(null);
//   const [studentName, setStudentName] = useState("[student_name]");
//   const [popup, setPopup] = useState({
//     isVisible: false,
//     message: "",
//     type: "",
//   });

//   const handleFileChange = (e, setter) => {
//     const file = e.target.files[0];
//     setter(file);
//   };

//   const getUrlFromFile = (file) => {
//     if (!file) return "";
//     return URL.createObjectURL(file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Your existing submit logic
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="mx-auto py-8 px-4">
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <BookOpen className="w-8 h-8 text-blue-600" />
//             </div>
//             Create New Certificate Template
//           </h1>
//         </div>

//         <div className="flex gap-6">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Student Name */}
//             <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
//               <label className="block font-medium">Student Name</label>
//               <input
//                 value={studentName}
//                 onChange={(e) => setStudentName(e.target.value)}
//                 className="w-full border rounded-lg px-4 py-3"
//               />
//               <label className="block font-medium">Background</label>
//               <input
//                 type="file"
//                 onChange={(e) => handleFileChange(e, setBackgroundImage)}
//                 className="w-full border rounded-lg px-4 py-3"
//               />
//             </div>

//             {/* Title Customization */}
//             <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
//               <label className="block font-medium">Title Text</label>
//               <input
//                 value={title.title}
//                 onChange={(e) => setTitle({ ...title, title: e.target.value })}
//                 className="w-full border rounded-lg px-4 py-3"
//               />
//               <label className="block font-medium">Font Size</label>
//               <input
//                 type="number"
//                 value={title.fontSize}
//                 onChange={(e) =>
//                   setTitle({ ...title, fontSize: parseInt(e.target.value) })
//                 }
//                 className="w-full border rounded-lg px-4 py-3"
//               />
//               <label className="block font-medium">Font Color</label>
//               <input
//                 type="color"
//                 value={title.fontColor}
//                 onChange={(e) =>
//                   setTitle({ ...title, fontColor: e.target.value })
//                 }
//               />
//             </div>

//             {/* Body Customization */}
//             <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
//               <label className="block font-medium">Body Text</label>
//               <textarea
//                 value={body.content}
//                 onChange={(e) => setBody({ ...body, content: e.target.value })}
//                 className="w-full border rounded-lg px-4 py-3"
//               />
//               <label className="block font-medium">Font Size</label>
//               <input
//                 type="number"
//                 value={body.fontSize}
//                 onChange={(e) =>
//                   setBody({ ...body, fontSize: parseInt(e.target.value) })
//                 }
//                 className="w-full border rounded-lg px-4 py-3"
//               />
//               <label className="block font-medium">Font Color</label>
//               <input
//                 type="color"
//                 value={body.fontColor}
//                 onChange={(e) =>
//                   setBody({ ...body, fontColor: e.target.value })
//                 }
//               />
//             </div>

//             {/* Signature and Stamp Upload */}
//             <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
//               <label className="block font-medium">Signature</label>
//               <input
//                 type="file"
//                 onChange={(e) => handleFileChange(e, setSignature)}
//                 className="w-full border rounded-lg px-4 py-3"
//               />
//               <label className="block font-medium">Stamp</label>
//               <input
//                 type="file"
//                 onChange={(e) => handleFileChange(e, setStamp)}
//                 className="w-full border rounded-lg px-4 py-3"
//               />
//             </div>

//             <div className="flex justify-end">
//               <button
//                 type="submit"
//                 className="bg-blue-600 text-white px-6 py-3 rounded-lg"
//               >
//                 Create Certificate Template
//               </button>
//             </div>
//           </form>

//           {/* Preview Canvas */}
//           <div
//             className="relative bg-red-400 w-[800px] h-[600px] overflow-hidden rounded-lg shadow"
//             ref={containerRef}
//           >
//             {backgroundImage ? (
//               <img
//                 src={getUrlFromFile(backgroundImage)}
//                 className="w-full h-full object-cover absolute top-0 left-0"
//                 alt="Background"
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center text-white">
//                 Upload Background Image
//               </div>
//             )}

//             {isContainerReady && (
//               <>
//                 {/* Title */}
//                 <motion.div
//                   drag
//                   dragConstraints={containerRef}
//                   dragMomentum={false}
//                   style={{
//                     position: "absolute",
//                     fontSize: title.fontSize,
//                     color: title.fontColor,
//                     cursor: "grab",
//                   }}
//                   onDragEnd={(e, info) => {
//                     const rect = containerRef.current.getBoundingClientRect();
//                     const x = info.point.x - rect.left;
//                     const y = info.point.y - rect.top;
//                     setTitle({ ...title, position: { x, y } });
//                   }}
//                 >
//                   {title.title}
//                 </motion.div>

//                 {/* Body */}
//                 <motion.div
//                   drag
//                   dragConstraints={containerRef}
//                   dragMomentum={false}
//                   style={{
//                     position: "absolute",
//                     fontSize: body.fontSize,
//                     color: body.fontColor,
//                     cursor: "grab",
//                   }}
//                   onDragEnd={(e, info) => {
//                     const rect = containerRef.current.getBoundingClientRect();
//                     const x = info.point.x - rect.left;
//                     const y = info.point.y - rect.top;
//                     setBody({ ...body, position: { x, y } });
//                   }}
//                 >
//                   {body.content}
//                 </motion.div>

//                 {/* Signature */}
//                 {signature && (
//                   <motion.div
//                     drag
//                     dragConstraints={containerRef}
//                     dragMomentum={false}
//                     style={{
//                       position: "absolute",
//                       cursor: "grab",
//                     }}
//                     onDragEnd={(e, info) => {
//                       const rect = containerRef.current.getBoundingClientRect();
//                       const x = info.point.x - rect.left;
//                       const y = info.point.y - rect.top;
//                       setSignaturePosition({ x, y });
//                     }}
//                   >
//                     <div
//                       style={{
//                         backgroundImage: `url(${getUrlFromFile(signature)})`,
//                       }}
//                     ></div>
//                   </motion.div>
//                 )}

//                 {/* Stamp */}
//                 {stamp && (
//                   <motion.div
//                     drag
//                     dragConstraints={containerRef}
//                     dragMomentum={false}
//                     style={{ position: "absolute", cursor: "grab" }}
//                     onDragEnd={(e, info) => {
//                       const rect = containerRef.current.getBoundingClientRect();
//                       const x = info.point.x - rect.left;
//                       const y = info.point.y - rect.top;
//                       setStampPosition({ x, y });
//                     }}
//                   >
//                     <div>
//                       <img
//                         src={getUrlFromFile(stamp)}
//                         alt="Stamp"
//                         className="w-24"
//                       />
//                     </div>
//                   </motion.div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       <PopupAlert
//         message={popup.message}
//         type={popup.type}
//         isVisible={popup.isVisible}
//         onClose={() => setPopup({ ...popup, isVisible: false })}
//       />
//     </div>
//   );
// };

// export default CreateCertificateTemplate;

import React, { useRef, useState, useEffect } from "react";
import { BookOpen, Upload, Eye, Settings, Move, X } from "lucide-react";
import axiosInstance from "../../services/axiosConfig";

const CreateCertificateTemplate = () => {
  const containerRef = useRef(null);
  const [isContainerReady, setIsContainerReady] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (containerRef.current) setIsContainerReady(true);
  }, []);

  // Basic Template Info
  const [templateInfo, setTemplateInfo] = useState({
    locale: "EN",
    title: "Course Completion Certificate",
    type: "course",
    status: "publish",
    backgroundImage: null,
  });

  // Template Elements with positions
  const [elements, setElements] = useState({
    title: {
      content: "Certificate of Completion",
      font_size: "32",
      font_color: "#8B0000",
      styles: "font-family: Arial;",
      font_weight_bold: true,
      text_center: true,
      enable: true,
      position: { x: 400, y: 150 }, // Fixed position for title
      draggable: false,
    },
    subtitle: {
      content: "Awarded for Excellence",
      font_size: "20",
      font_color: "#8B0000",
      text_center: true,
      enable: true,
      position: { x: 400, y: 195 },
      draggable: true,
    },
    body: {
      content: "This certificate is awarded to",
      font_size: "16",
      font_color: "#000",
      text_center: true,
      enable: true,
      position: { x: 400, y: 265 },
      draggable: true,
    },
    student_name: {
      content: "[student_name]",
      font_size: "28",
      font_color: "#000",
      font_weight_bold: true,
      text_center: true,
      enable: true,
      position: { x: 400, y: 285 },
      draggable: true,
    },
    completion_text: {
      content: "for successfully completing the course.",
      font_size: "16",
      font_color: "#000",
      text_center: true,
      enable: true,
      position: { x: 400, y: 350 },
      draggable: true,
    },
    date: {
      content: "Masterclass on [date]",
      font_size: "14",
      font_color: "#000",
      display_date: "textual",
      text_center: true,
      enable: true,
      position: { x: 400, y: 375 },
      draggable: true,
    },
    instructor_name: {
      content: "",
      // content: "[instructor_name]",
      font_size: "14",
      font_color: "#000",
      text_center: false,
      enable: true,
      position: { x: 100, y: 500 },
      draggable: true,
    },
    platform_name: {
      content: "",
      // content: "[platform_name]",
      font_size: "14",
      font_color: "#000",
      text_center: false,
      enable: true,
      position: { x: 100, y: 520 },
      draggable: true,
    },
    // qr_code: {
    //   content: "[qr_code]",
    //   image_size: "80",
    //   image: null,
    //   enable: true,
    //   position: { x: 400, y: 450 },
    //   draggable: true,
    // },
    hint: {
      content: "Verify at lms.rocket-soft.org",
      font_size: "12",
      font_color: "#666",
      text_center: true,
      enable: true,
      position: { x: 400, y: 550 },
      draggable: true,
    },
    platform_signature: {
      content: "[platform_signature]",
      image: null,
      image_size: "128",
      enable: true,
      position: { x: 400, y: 480 },
      draggable: true,
    },
    stamp: {
      content: "[stamp]",
      image: null,
      image_size: "128",
      enable: true,
      position: { x: 500, y: 450 },
      draggable: true,
    },
    user_certificate_additional: {
      content: "[user_certificate_additional]",
      enable: false,
      position: { x: 400, y: 400 },
      draggable: true,
    },
  });

  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const handleTemplateInfoChange = (field, value) => {
    setTemplateInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleElementChange = (elementKey, field, value) => {
    setElements((prev) => ({
      ...prev,
      [elementKey]: {
        ...prev[elementKey],
        [field]: value,
      },
    }));
  };

  const handlePositionChange = (elementKey, newPosition) => {
    setElements((prev) => ({
      ...prev,
      [elementKey]: {
        ...prev[elementKey],
        position: newPosition,
      },
    }));
  };

  const handleFileChange = (e, elementKey, field) => {
    const file = e.target.files[0];
    if (elementKey === "template") {
      handleTemplateInfoChange(field, file);
    } else {
      handleElementChange(elementKey, field, file);
    }
  };

  const getUrlFromFile = (file) => {
    if (!file) return "";
    return URL.createObjectURL(file);
  };

  const handleMouseDown = (e, elementKey) => {
    if (!elements[elementKey].draggable) return;

    const rect = containerRef.current.getBoundingClientRect();
    const elementRect = e.currentTarget.getBoundingClientRect();

    setDraggedElement(elementKey);
    setDragOffset({
      x: e.clientX - elementRect.left,
      y: e.clientY - elementRect.top,
    });

    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!draggedElement || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    // Constrain within container bounds
    const constrainedX = Math.max(0, Math.min(newX, rect.width - 100));
    const constrainedY = Math.max(0, Math.min(newY, rect.height - 30));

    handlePositionChange(draggedElement, {
      x: constrainedX,
      y: constrainedY,
    });
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (draggedElement) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggedElement, dragOffset]);

  // const handleSubmit = async () => {
  //   const formData = new FormData();

  //   // Add basic template info
  //   formData.append('locale', templateInfo.locale);
  //   formData.append('title', templateInfo.title);
  //   formData.append('type', templateInfo.type);
  //   formData.append('status', templateInfo.status);
  //   formData.append('template_contents', '<div class="certificate-template-container"></div>');

  //   if (templateInfo.backgroundImage) {
  //     formData.append('image', templateInfo.backgroundImage);
  //   }

  //   // Add elements with positions
  //   Object.entries(elements).forEach(([key, element]) => {
  //     Object.entries(element).forEach(([field, value]) => {
  //       if (field === 'image' && value instanceof File) {
  //         formData.append(`elements[${key}][${field}]`, value);
  //       } else if (field === 'position') {
  //         formData.append(`elements[${key}][position_x]`, value.x.toString());
  //         formData.append(`elements[${key}][position_y]`, value.y.toString());
  //       } else {
  //         formData.append(`elements[${key}][${field}]`, value.toString());
  //       }
  //     });
  //   });

  //   console.log('Form data ready for submission:', formData);
  //   setPopup({
  //     isVisible: true,
  //     message: "Certificate template data prepared! Check console for FormData.",
  //     type: "success"
  //   });
  // };

  const handleSubmit = async () => {
    const formData = new FormData();

    // Add basic template info
    formData.append("locale", templateInfo.locale);
    formData.append("title", templateInfo.title);
    formData.append("type", templateInfo.type);
    formData.append("status", templateInfo.status);
    formData.append(
      "template_contents",
      '<div class="certificate-template-container"></div>'
    );

    if (templateInfo.backgroundImage) {
      formData.append("image", templateInfo.backgroundImage);
    }

    // Add elements with positions
    Object.entries(elements).forEach(([key, element]) => {
      Object.entries(element).forEach(([field, value]) => {
        if (field === "image" && value instanceof File) {
          formData.append(`elements[${key}][${field}]`, value);
        } else if (field === "position") {
          formData.append(`elements[${key}][position_x]`, value.x?.toString());
          formData.append(`elements[${key}][position_y]`, value.y?.toString());
        } else {
          formData.append(`elements[${key}][${field}]`, value?.toString());
        }
      });
    });

    try {
      // setPopup({
      //   isVisible: true,
      //   message: "Saving certificate template...",
      //   type: "info",
      // });

      setLoading(true);

      const response = await axiosInstance.post(
        "/certificate-templates",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Response:", response);
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }

      // const result = await response.json();

      setPopup({
        isVisible: true,
        message: "Certificate template saved successfully!",
        type: "success",
      });
      setLoading(false);
      // console.log("Template saved:", result);
      setTemplateInfo({
        locale: "EN",
        title: "Course Completion Certificate",
        type: "course",
        status: "publish",
        backgroundImage: null,
      });
      setElements({
        title: {
          content: "Certificate of Completion",
          font_size: "32",
          font_color: "#8B0000",
          styles: "font-family: Arial;",
          font_weight_bold: true,
          text_center: true,
          enable: true,
          position: { x: 400, y: 80 }, // Fixed position for title
          draggable: false,
        },
        subtitle: {
          content: "Awarded for Excellence",
          font_size: "20",
          font_color: "#8B0000",
          text_center: true,
          enable: true,
          position: { x: 400, y: 130 },
          draggable: true,
        },
        body: {
          content: "This certificate is awarded to",
          font_size: "16",
          font_color: "#000",
          text_center: true,
          enable: true,
          position: { x: 400, y: 200 },
          draggable: true,
        },
        student_name: {
          content: "[student_name]",
          font_size: "28",
          font_color: "#000",
          font_weight_bold: true,
          text_center: true,
          enable: true,
          position: { x: 400, y: 250 },
          draggable: true,
        },
        completion_text: {
          content: "for successfully completing the course.",
          font_size: "16",
          font_color: "#000",
          text_center: true,
          enable: true,
          position: { x: 400, y: 300 },
          draggable: true,
        },
        date: {
          content: "[date]",
          font_size: "14",
          font_color: "#000",
          display_date: "textual",
          text_center: true,
          enable: true,
          position: { x: 400, y: 400 },
          draggable: true,
        },
        instructor_name: {
          content: "[instructor_name]",
          font_size: "14",
          font_color: "#000",
          text_center: false,
          enable: true,
          position: { x: 100, y: 500 },
          draggable: true,
        },
        platform_name: {
          content: "[platform_name]",
          font_size: "14",
          font_color: "#000",
          text_center: false,
          enable: true,
          position: { x: 100, y: 520 },
          draggable: true,
        },
        // qr_code: {
        //   content: "[qr_code]",
        //   image_size: "80",
        //   image: null,
        //   enable: true,
        //   position: { x: 400, y: 450 },
        //   draggable: true,
        // },
        hint: {
          content: "Verify at lms.rocket-soft.org",
          font_size: "12",
          font_color: "#666",
          text_center: true,
          enable: true,
          position: { x: 400, y: 550 },
          draggable: true,
        },
        platform_signature: {
          content: "[platform_signature]",
          image: null,
          image_size: "80",
          enable: true,
          position: { x: 400, y: 480 },
          draggable: true,
        },
        stamp: {
          content: "[stamp]",
          image: null,
          image_size: "80",
          enable: true,
          position: { x: 500, y: 450 },
          draggable: true,
        },
        user_certificate_additional: {
          content: "[user_certificate_additional]",
          enable: false,
          position: { x: 400, y: 400 },
          draggable: true,
        },
      });
    } catch (error) {
      setLoading(false);
      console.log("Error saving template:", error);
      setPopup({
        isVisible: true,
        message: `Error saving template: ${error.message}`,
        type: "error",
      });
    }
  };

  const renderTextElement = (elementKey, element) => {
    if (!element.enable) return null;

    // Don't show instructor_name, platform_name, or hint if they haven't been customized
    if (
      (elementKey === "instructor_name" && element.content === "[instructor_name]") ||
      (elementKey === "platform_name" && element.content === "[platform_name]") ||
      (elementKey === "hint" && element.content === "Verify at lms.rocket-soft.org")
    ) {
      return null;
    }

    const content = element.content
      .replace("[student_name]", "John Doe")
      .replace("[instructor_name]", "Jane Smith")
      .replace("[platform_name]", "LMS Platform")
      .replace("[date]", new Date().toLocaleDateString());

    const isDragging = draggedElement === elementKey;
    const isTitle = elementKey === "title";

    return (
      <div
        key={elementKey}
        onMouseDown={(e) => handleMouseDown(e, elementKey)}
        style={{
          position: "absolute",
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          transform: element.text_center ? "translateX(-50%)" : "none",
          fontSize: `${element.font_size}px`,
          color: element.font_color,
          fontWeight: element.font_weight_bold ? "bold" : "normal",
          textAlign: element.text_center ? "center" : "left",
          maxWidth: element.text_center ? "500px" : "400px",
          wordWrap: "break-word",
          cursor: element.draggable ? "move" : "default",
          userSelect: "none",
          zIndex: isDragging ? 10 : 1,
          opacity: isDragging ? 0.8 : 1,
          border: isDragging ? "2px dashed #3b82f6" : "none",
          padding: "2px",
          backgroundColor: isDragging
            ? "rgba(59, 130, 246, 0.1)"
            : "transparent",
          borderRadius: "4px",
        }}
        className={`${
          element.draggable
            ? "hover:bg-blue-50 hover:border hover:border-blue-300"
            : ""
        } ${isTitle ? "ring-2 ring-red-200" : ""}`}
        title={
          isTitle
            ? "Title is fixed and cannot be moved"
            : element.draggable
            ? "Drag to move"
            : ""
        }
      >
        {element.draggable && !isDragging && (
          <Move className="w-4 h-4 text-blue-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100" />
        )}
        {content}
      </div>
    );
  };

  const renderImageElement = (elementKey, element) => {
    if (!element.enable) return null;

    const isDragging = draggedElement === elementKey;

    // if (elementKey === "qr_code") {
    //   return (
    //     <div
    //       key={elementKey}
    //       onMouseDown={(e) => handleMouseDown(e, elementKey)}
    //       style={{
    //         position: "absolute",
    //         left: `${element.position.x}px`,
    //         top: `${element.position.y}px`,
    //         width: `${element.image_size}px`,
    //         height: `${element.image_size}px`,
    //         backgroundColor: "#f0f0f0",
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //         fontSize: "12px",
    //         color: "#666",
    //         border: "1px solid #ccc",
    //         cursor: "move",
    //         userSelect: "none",
    //         zIndex: isDragging ? 10 : 1,
    //         opacity: isDragging ? 0.8 : 1,
    //         borderColor: isDragging ? "#3b82f6" : "#ccc",
    //         borderWidth: isDragging ? "2px" : "1px",
    //         borderStyle: isDragging ? "dashed" : "solid",
    //       }}
    //       className="hover:bg-blue-50 hover:border-blue-300 group"
    //       title="Drag to move"
    //     >
    //       <Move className="w-4 h-4 text-blue-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100" />
    //       QR Code
    //     </div>
    //   );
    // }

    if (!element.image) return null;

    return (
      <div
        key={elementKey}
        onMouseDown={(e) => handleMouseDown(e, elementKey)}
        style={{
          position: "absolute",
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          cursor: "move",
          userSelect: "none",
          zIndex: isDragging ? 10 : 1,
          opacity: isDragging ? 0.8 : 1,
          border: isDragging ? "2px dashed #3b82f6" : "none",
          padding: "2px",
          backgroundColor: isDragging
            ? "rgba(59, 130, 246, 0.1)"
            : "transparent",
          borderRadius: "4px",
        }}
        className="hover:bg-blue-50 hover:border hover:border-blue-300 group"
        title="Drag to move"
      >
        <Move className="w-4 h-4 text-blue-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100" />
        <img
          src={getUrlFromFile(element.image)}
          alt={elementKey}
          style={{
            width: `${element.image_size}px`,
            height: `${element.image_size}px`,
            objectFit: "contain",
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-white/[0.03]">
      <div className="mx-auto ">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            Create Certificate Template
          </h1>
          <p className="text-gray-600 mt-2">
            <span className="inline-flex items-center gap-1 text-sm bg-blue-100 dark:text-white/70 dark:bg-white/[0.056] px-2 py-1 rounded">
              <Move className="w-4 h-4" />
              Drag elements to reposition them on the certificate
            </span>
            <span className="ml-2 text-sm text-red-600">
              * Title position is fixed and cannot be moved
            </span>
          </p>
        </div>

        <div className="flex gap-6">
          {/* Form Section */}
          <div className="w-1/4 space-y-6">
            <div className="space-y-6">
              {/* Template Information */}
              <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-sm p-6">
                <h2 className="text-xl dark:text-white/90 font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Template Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2 dark:text-white/90">
                      Template Title
                    </label>
                    <input
                      type="text"
                      value={templateInfo.title}
                      onChange={(e) =>
                        handleTemplateInfoChange("title", e.target.value)
                      }
                      className="w-full border dark:text-white/70 rounded-lg px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2 dark:text-white/90">
                      Locale
                    </label>
                    <select
                      value={templateInfo.locale}
                      onChange={(e) =>
                        handleTemplateInfoChange("locale", e.target.value)
                      }
                      className="w-full border dark:text-white/70 rounded-lg px-4 py-3"
                    >
                      <option className="dark:text-black" value="EN">
                        English
                      </option>
                      <option className="dark:text-black" value="ES">
                        Spanish
                      </option>
                      <option className="dark:text-black" value="FR">
                        French
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-2 dark:text-white/90">
                      Type
                    </label>
                    <select
                      value={templateInfo.type}
                      onChange={(e) =>
                        handleTemplateInfoChange("type", e.target.value)
                      }
                      className="w-full border dark:text-white/70 rounded-lg px-4 py-3"
                    >
                      <option className="dark:text-black" value="">
                        Select type
                      </option>
                      <option className="dark:text-black" value="quiz">
                        Quiz
                      </option>
                      <option className="dark:text-black" value="course">
                        Course
                      </option>
                      <option className="dark:text-black" value="bundle">
                        Bundle
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-2 dark:text-white/90">
                      Status
                    </label>
                    <select
                      value={templateInfo.status}
                      onChange={(e) =>
                        handleTemplateInfoChange("status", e.target.value)
                      }
                      className="w-full dark:text-white/70 border rounded-lg px-4 py-3"
                    >
                      <option className="dark:text-black" value="publish">
                        Publish
                      </option>
                      <option className="dark:text-black" value="draft">
                        Draft
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-2 dark:text-white/90">
                      Background Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange(e, "template", "backgroundImage")
                      }
                      className="w-full border dark:text-white/70 rounded-lg px-4 py-3"
                    />
                  </div>
                </div>
              </div>

              {/* Certificate Elements */}
              <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-white/90">
                  Certificate Elements
                </h2>
                <div className="space-y-6">
                  {/* Title Element */}
                  <div className="border rounded-lg p-4 border-red-200 dark:bg-red-100/10 bg-red-50">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.title.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "title",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium text-red-700">
                        Title (Fixed Position)
                      </label>
                    </div>
                    {elements.title.enable && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={elements.title.content}
                          onChange={(e) =>
                            handleElementChange(
                              "title",
                              "content",
                              e.target.value
                            )
                          }
                          className="w-full border dark:text-white/70 rounded px-3 py-2"
                          placeholder="Title text"
                        />
                        <div className="flex gap-3 flex-wrap">
                          <input
                            type="number"
                            value={elements.title.font_size}
                            onChange={(e) =>
                              handleElementChange(
                                "title",
                                "font_size",
                                e.target.value
                              )
                            }
                            className="border rounded dark:text-white/70 px-3 py-2 w-20"
                            placeholder="Size"
                          />
                          <input
                            type="color"
                            value={elements.title.font_color}
                            onChange={(e) =>
                              handleElementChange(
                                "title",
                                "font_color",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2"
                          />
                          <label className="flex items-center gap-2 dark:text-white/70">
                            <input
                              type="checkbox"
                              checked={elements.title.font_weight_bold}
                              onChange={(e) =>
                                handleElementChange(
                                  "title",
                                  "font_weight_bold",
                                  e.target.checked
                                )
                              }
                            />
                            Bold
                          </label>
                          <label className="flex items-center gap-2 dark:text-white/70">
                            <input
                              type="checkbox"
                              checked={elements.title.text_center}
                              onChange={(e) =>
                                handleElementChange(
                                  "title",
                                  "text_center",
                                  e.target.checked
                                )
                              }
                            />
                            Center
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subtitle Element */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.subtitle.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "subtitle",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium flex items-center gap-2 dark:text-white/90">
                        <Move className="w-4 h-4 text-blue-500" />
                        Subtitle
                      </label>
                    </div>
                    {elements.subtitle.enable && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={elements.subtitle.content}
                          onChange={(e) =>
                            handleElementChange(
                              "subtitle",
                              "content",
                              e.target.value
                            )
                          }
                          className="w-full border dark:text-white/70 rounded px-3 py-2"
                        />
                        <div className="flex gap-3">
                          <input
                            type="number"
                            value={elements.subtitle.font_size}
                            onChange={(e) =>
                              handleElementChange(
                                "subtitle",
                                "font_size",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2 w-20"
                          />
                          <input
                            type="color"
                            value={elements.subtitle.font_color}
                            onChange={(e) =>
                              handleElementChange(
                                "subtitle",
                                "font_color",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2"
                          />
                          <label className="flex items-center dark:text-white/70 gap-2">
                            <input
                              type="checkbox"
                              checked={elements.subtitle.text_center}
                              onChange={(e) =>
                                handleElementChange(
                                  "subtitle",
                                  "text_center",
                                  e.target.checked
                                )
                              }
                            />
                            Center
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body Element */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.body.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "body",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium dark:text-white/90 flex items-center gap-2">
                        <Move className="w-4 h-4 text-blue-500" />
                        Body Text
                      </label>
                    </div>
                    {elements.body.enable && (
                      <div className="space-y-3">
                        <textarea
                          value={elements.body.content}
                          onChange={(e) =>
                            handleElementChange(
                              "body",
                              "content",
                              e.target.value
                            )
                          }
                          className="w-full dark:text-white/70 border rounded px-3 py-2"
                          rows="3"
                        />
                        <div className="flex gap-3">
                          <input
                            type="number"
                            value={elements.body.font_size}
                            onChange={(e) =>
                              handleElementChange(
                                "body",
                                "font_size",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2 w-20"
                          />
                          <input
                            type="color"
                            value={elements.body.font_color}
                            onChange={(e) =>
                              handleElementChange(
                                "body",
                                "font_color",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2"
                          />
                          <label className="flex items-center dark:text-white/70 gap-2">
                            <input
                              type="checkbox"
                              checked={elements.body.text_center}
                              onChange={(e) =>
                                handleElementChange(
                                  "body",
                                  "text_center",
                                  e.target.checked
                                )
                              }
                            />
                            Center
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Student Name Element */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.student_name.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "student_name",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium flex items-center dark:text-white/90 gap-2">
                        <Move className="w-4 h-4 text-blue-500 " />
                        Student Name
                      </label>
                    </div>
                    {elements.student_name.enable && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={elements.student_name.content}
                          onChange={(e) =>
                            handleElementChange(
                              "student_name",
                              "content",
                              e.target.value
                            )
                          }
                          className="w-full border dark:text-white/70 rounded px-3 py-2"
                        />
                        <div className="flex gap-3 flex-wrap">
                          <input
                            type="number"
                            value={elements.student_name.font_size}
                            onChange={(e) =>
                              handleElementChange(
                                "student_name",
                                "font_size",
                                e.target.value
                              )
                            }
                            className="border rounded dark:text-white/70 px-3 py-2 w-20"
                          />
                          <input
                            type="color"
                            value={elements.student_name.font_color}
                            onChange={(e) =>
                              handleElementChange(
                                "student_name",
                                "font_color",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2"
                          />
                          <label className="flex items-center dark:text-white/70 gap-2">
                            <input
                              type="checkbox"
                              checked={elements.student_name.font_weight_bold}
                              onChange={(e) =>
                                handleElementChange(
                                  "student_name",
                                  "font_weight_bold",
                                  e.target.checked
                                )
                              }
                            />
                            Bold
                          </label>
                          <label className="flex items-center dark:text-white/70 gap-2">
                            <input
                              type="checkbox"
                              checked={elements.student_name.text_center}
                              onChange={(e) =>
                                handleElementChange(
                                  "student_name",
                                  "text_center",
                                  e.target.checked
                                )
                              }
                            />
                            Center
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Platform Signature */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.platform_signature.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "platform_signature",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium flex items-center dark:text-white/90 gap-2">
                        <Move className="w-4 h-4 text-blue-500 " />
                        Platform Signature
                      </label>
                    </div>
                    {elements.platform_signature.enable && (
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(e, "platform_signature", "image")
                          }
                          className="w-full dark:text-white/70 border rounded px-3 py-2"
                        />

                        <div>
                          <label className="block font-medium mb-2 dark:text-white/90">
                            Size
                          </label>
                          <select
                            value={elements.platform_signature.image_size}
                            onChange={(e) =>
                              handleElementChange(
                                "platform_signature",
                                "image_size",
                                e.target.value
                              )
                            }
                            className="w-full dark:text-white/70 border rounded-lg px-4 py-3"
                          >
                            <option className="dark:text-black" value="128">
                              128
                            </option>
                            <option className="dark:text-black" value="192">
                              192
                            </option>
                            <option className="dark:text-black" value="256">
                              256
                            </option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* QR Code */}
                  {/* <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.qr_code.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "qr_code",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium flex items-center gap-2">
                        <Move className="w-4 h-4 text-blue-500" />
                        QR Code
                      </label>
                    </div>

                    {elements.qr_code.enable && (
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(e, "qr_code", "image")
                          }
                          className="w-full border rounded px-3 py-2"
                        />
                        <input
                          type="number"
                          value={elements.qr_code.image_size}
                          onChange={(e) =>
                            handleElementChange(
                              "qr_code",
                              "image_size",
                              e.target.value
                            )
                          }
                          className="border rounded px-3 py-2 w-20"
                          placeholder="Size"
                        />
                      </div>
                    )}
                  </div> */}

                  {/* Stamp */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.stamp.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "stamp",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium flex items-center dark:text-white/90 gap-2">
                        <Move className="w-4 h-4 text-blue-500" />
                        Stamp
                      </label>
                    </div>
                    {elements.stamp.enable && (
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(e, "stamp", "image")
                          }
                          className="w-full dark:text-white/70 border rounded px-3 py-2"
                        />

                        <div>
                          <label className="block font-medium mb-2 dark:text-white/90">
                            Size
                          </label>
                          <select
                            value={elements.stamp.image_size}
                            onChange={(e) =>
                              handleElementChange(
                                "stamp",
                                "image_size",
                                e.target.value
                              )
                            }
                            className="w-full border dark:text-white/70 rounded-lg px-4 py-3"
                          >
                            <option className="dark:text-black" value="128">
                              128
                            </option>
                            <option className="dark:text-black" value="192">
                              192
                            </option>
                            <option className="dark:text-black" value="256">
                              256
                            </option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Date Element */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.date.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "date",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium flex dark:text-white/90 items-center gap-2">
                        <Move className="w-4 h-4 text-blue-500" />
                        Date
                      </label>
                    </div>
                    {elements.date.enable && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={elements.date.content}
                          onChange={(e) =>
                            handleElementChange(
                              "date",
                              "content",
                              e.target.value
                            )
                          }
                          className="w-full dark:text-white/70 border rounded px-3 py-2"
                        />
                        <div className="flex gap-3">
                          <input
                            type="number"
                            value={elements.date.font_size}
                            onChange={(e) =>
                              handleElementChange(
                                "date",
                                "font_size",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2 w-20"
                          />
                          <input
                            type="color"
                            value={elements.date.font_color}
                            onChange={(e) =>
                              handleElementChange(
                                "date",
                                "font_color",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2"
                          />
                          <label className="flex items-center dark:text-white/70 gap-2">
                            <input
                              type="checkbox"
                              checked={elements.date.text_center}
                              onChange={(e) =>
                                handleElementChange(
                                  "date",
                                  "text_center",
                                  e.target.checked
                                )
                              }
                            />
                            Center
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Completion Text Element */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.completion_text.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "completion_text",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium flex dark:text-white/90 items-center gap-2">
                        <Move className="w-4 h-4 text-blue-500" />
                        Completion Text
                      </label>
                    </div>
                    {elements.completion_text.enable && (
                      <div className="space-y-3">
                        <textarea
                          value={elements.completion_text.content}
                          onChange={(e) =>
                            handleElementChange(
                              "completion_text",
                              "content",
                              e.target.value
                            )
                          }
                          className="w-full border dark:text-white/70 rounded px-3 py-2"
                          rows="2"
                        />
                        <div className="flex gap-3">
                          <input
                            type="number"
                            value={elements.completion_text.font_size}
                            onChange={(e) =>
                              handleElementChange(
                                "completion_text",
                                "font_size",
                                e.target.value
                              )
                            }
                            className="border rounded dark:text-white/70 px-3 py-2 w-20"
                          />
                          <input
                            type="color"
                            value={elements.completion_text.font_color}
                            onChange={(e) =>
                              handleElementChange(
                                "completion_text",
                                "font_color",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2"
                          />
                          <label className="flex items-center gap-2 dark:text-white/70">
                            <input
                              type="checkbox"
                              checked={elements.completion_text.text_center}
                              onChange={(e) =>
                                handleElementChange(
                                  "completion_text",
                                  "text_center",
                                  e.target.checked
                                )
                              }
                            />
                            Center
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instructor Name Element */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.instructor_name.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "instructor_name",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium flex dark:text-white/90  items-center gap-2">
                        <Move className="w-4 h-4 text-blue-500" />
                        Instructor Name
                      </label>
                    </div>
                    {elements.instructor_name.enable && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={elements.instructor_name.content}
                          onChange={(e) =>
                            handleElementChange(
                              "instructor_name",
                              "content",
                              e.target.value
                            )
                          }
                          className="w-full dark:text-white/70 border rounded px-3 py-2"
                        />
                        <div className="flex gap-3">
                          <input
                            type="number"
                            value={elements.instructor_name.font_size}
                            onChange={(e) =>
                              handleElementChange(
                                "instructor_name",
                                "font_size",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2 w-20"
                          />
                          <input
                            type="color"
                            value={elements.instructor_name.font_color}
                            onChange={(e) =>
                              handleElementChange(
                                "instructor_name",
                                "font_color",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2"
                          />
                          <label className="flex items-center dark:text-white/70 gap-2">
                            <input
                              type="checkbox"
                              checked={elements.instructor_name.text_center}
                              onChange={(e) =>
                                handleElementChange(
                                  "instructor_name",
                                  "text_center",
                                  e.target.checked
                                )
                              }
                            />
                            Center
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Platform Name Element */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.platform_name.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "platform_name",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium dark:text-white/90 flex items-center gap-2">
                        <Move className="w-4 h-4 text-blue-500" />
                        Platform Name
                      </label>
                    </div>
                    {elements.platform_name.enable && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={elements.platform_name.content}
                          onChange={(e) =>
                            handleElementChange(
                              "platform_name",
                              "content",
                              e.target.value
                            )
                          }
                          className="w-full dark:text-white/70 border rounded px-3 py-2"
                        />
                        <div className="flex gap-3">
                          <input
                            type="number"
                            value={elements.platform_name.font_size}
                            onChange={(e) =>
                              handleElementChange(
                                "platform_name",
                                "font_size",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2 w-20"
                          />
                          <input
                            type="color"
                            value={elements.platform_name.font_color}
                            onChange={(e) =>
                              handleElementChange(
                                "platform_name",
                                "font_color",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2"
                          />
                          <label className="flex items-center gap-2 dark:text-white/70">
                            <input
                              type="checkbox"
                              checked={elements.platform_name.text_center}
                              onChange={(e) =>
                                handleElementChange(
                                  "platform_name",
                                  "text_center",
                                  e.target.checked
                                )
                              }
                            />
                            Center
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hint Element */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.hint.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "hint",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium dark:text-white/90 flex items-center gap-2">
                        <Move className="w-4 h-4 text-blue-500" />
                        Hint Text
                      </label>
                    </div>
                    {elements.hint.enable && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={elements.hint.content}
                          onChange={(e) =>
                            handleElementChange(
                              "hint",
                              "content",
                              e.target.value
                            )
                          }
                          className="w-full border dark:text-white/70 rounded px-3 py-2"
                        />
                        <div className="flex gap-3">
                          <input
                            type="number"
                            value={elements.hint.font_size}
                            onChange={(e) =>
                              handleElementChange(
                                "hint",
                                "font_size",
                                e.target.value
                              )
                            }
                            className="border rounded dark:text-white/70 px-3 py-2 w-20"
                          />
                          <input
                            type="color"
                            value={elements.hint.font_color}
                            onChange={(e) =>
                              handleElementChange(
                                "hint",
                                "font_color",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2"
                          />
                          <label className="flex items-center gap-2 dark:text-white/70">
                            <input
                              type="checkbox"
                              checked={elements.hint.text_center}
                              onChange={(e) =>
                                handleElementChange(
                                  "hint",
                                  "text_center",
                                  e.target.checked
                                )
                              }
                            />
                            Center
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Certificate Additional Element */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={elements.user_certificate_additional.enable}
                        onChange={(e) =>
                          handleElementChange(
                            "user_certificate_additional",
                            "enable",
                            e.target.checked
                          )
                        }
                      />
                      <label className="font-medium dark:text-white/90 flex items-center gap-2">
                        <Move className="w-4 h-4 text-blue-500" />
                        Additional Info
                      </label>
                    </div>
                    {elements.user_certificate_additional.enable && (
                      <div className="space-y-3">
                        <textarea
                          value={elements.user_certificate_additional.content}
                          onChange={(e) =>
                            handleElementChange(
                              "user_certificate_additional",
                              "content",
                              e.target.value
                            )
                          }
                          className="w-full border dark:text-white/70 rounded px-3 py-2"
                          rows="2"
                        />
                        <div className="flex gap-3">
                          <input
                            type="number"
                            value={
                              elements.user_certificate_additional.font_size
                            }
                            onChange={(e) =>
                              handleElementChange(
                                "user_certificate_additional",
                                "font_size",
                                e.target.value
                              )
                            }
                            className="border rounded dark:text-white/70 px-3 py-2 w-20"
                          />
                          <input
                            type="color"
                            value={
                              elements.user_certificate_additional.font_color
                            }
                            onChange={(e) =>
                              handleElementChange(
                                "user_certificate_additional",
                                "font_color",
                                e.target.value
                              )
                            }
                            className="border dark:text-white/70 rounded px-3 py-2"
                          />
                          <label className="flex dark:text-white/70 items-center gap-2">
                            <input
                              type="checkbox"
                              checked={
                                elements.user_certificate_additional.text_center
                              }
                              onChange={(e) =>
                                handleElementChange(
                                  "user_certificate_additional",
                                  "text_center",
                                  e.target.checked
                                )
                              }
                            />
                            Center
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              {loading ? (
                <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-sm p-6">
                  <button className="w-full opacity-75 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    Creating ...
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-sm p-6">
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Create Template
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="w-3/4 h-full sticky top-0">
            <div className="bg-white  dark:bg-white/[0.03] rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold dark:text-white/90 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Certificate Preview
              </h2>
              <div className="rounded-lg ">
                <div
                  ref={containerRef}
                  className="relative bg-white border-2 border-gray-300 rounded-lg mx-auto overflow-hidden"
                  style={{
                    // minWidth: "600px",
                    // minHeight: "600px",
                    // width:"auto",
                    width: "800px",
                    height: "600px",
                    backgroundImage: templateInfo.backgroundImage
                      ? `url(${getUrlFromFile(templateInfo.backgroundImage)})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {/* Certificate Border */}
                  <div className="absolute  border-4 border-gray-300 rounded-lg"></div>

                  {/* Render all elements */}
                  {Object.entries(elements).map(([key, element]) => {
                    if (
                      key === "qr_code" ||
                      key === "platform_signature" ||
                      key === "stamp"
                    ) {
                      return renderImageElement(key, element);
                    }
                    return renderTextElement(key, element);
                  })}

                  {/* Drag helper overlay */}
                  {draggedElement && (
                    <div className="absolute inset-0 bg-blue-50 bg-opacity-30 pointer-events-none">
                      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                        Dragging: {draggedElement.replace("_", " ")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Popup */}
        {popup.isVisible && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
                <h3
                  className={`text-lg font-semibold ${
                    popup.type === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {popup.type === "success" ? "Success!" : "Error"}
                </h3>
                <button
                  onClick={() =>
                    setPopup({ isVisible: false, message: "", type: "" })
                  }
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-700 mb-4">{popup.message}</p>
              <button
                onClick={() =>
                  setPopup({ isVisible: false, message: "", type: "" })
                }
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  popup.type === "success"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCertificateTemplate;
