import { CircleHelp, Delete, Pen, Plus, Save, Trash, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../services/axiosConfig";
import { useDispatch } from "react-redux";
import { all } from "axios";
import toast from "react-hot-toast";
import PopupAlert from "../../../components/popUpAlert";

function Faqs({ courseId }) {
  const [allFaqs, setAllFaqs] = React.useState([]);
  const [showPopup, setShowPopup] = React.useState(false);
  const [faqData, setFaqData] = React.useState({
    question: "",
    answer: "",
    category: "course",
  });
  const [popup, setPopup] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });
  const [selectedFaq, setSelectedFaq] = React.useState(null);
  const dispatch = useDispatch();

  const getFaqs = async () => {
    try {
      const faqs = await axiosInstance.get(`/faqs/course/${courseId}`);
      console.log("faqs", faqs.data);
      setAllFaqs(faqs.data.data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  const handelAddPlan = async () => {
    try {
      if (selectedFaq) {
        const payload: any = {
          question: selectedFaq.question,
          answer: selectedFaq.answer,
          category: selectedFaq.category || "course",
        };
        const response = await axiosInstance.put(
          `/faqs/${selectedFaq._id}`,
          payload
        );
        setPopup({
          message: "FAQ updated successfully!",
          type: "success",
          isVisible: true,
        });
        setShowPopup(false);
        setSelectedFaq(null);
        setFaqData({
          question: "",
          answer: "",
        });
      } else {
        const payload: any = {
          courseId: courseId || "",
          question: selectedFaq ? selectedFaq.question : faqData.question,
          answer: selectedFaq ? selectedFaq.answer : faqData.answer,
          category: selectedFaq ? (selectedFaq.category || "course") : (faqData.category || "course"),
        };
        const response = await axiosInstance.post("/faqs", payload);
        setPopup({
          message: "FAQ added successfully!",
          type: "success",
          isVisible: true,
        });
        // console.log("response", response.data);
        setShowPopup(false);
        setSelectedFaq(null);
        setFaqData({
          question: "",
          answer: "",
          category: "course",
        });
      }
      getFaqs();
    } catch (error) {
      setPopup({
        message: "Failed to add or update FAQ.",
        type: "error",
        isVisible: true,
      });
      console.error("Error adding plan:", error);
    }
  };

  const deleteFaq = async (faqId) => {
    if (!faqId) {
      toast.error("FAQ ID is required to delete.");
      return;
    }
    try {
      const response = await axiosInstance.delete(`/faqs/${faqId}`);
      setPopup({
        message: "FAQ deleted successfully!",
        type: "success",
        isVisible: true,
      });
      setShowPopup(false);
      setSelectedFaq(null);
      setFaqData({
        question: "",
        answer: "",
      });
      getFaqs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      setPopup({
        message: "Failed to delete FAQ.",
        type: "error",
        isVisible: true,
      });
    }
  };

  useEffect(() => {
    if (courseId) {
      getFaqs();
    }
  }, [courseId]);
  return (
    <>
      <PopupAlert
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ ...popup, isVisible: false })}
      />
      {showPopup && (
        <div className="fixed top-0 left-0 h-screen right-0 bottom-0 bg-black/50 z-9999 flex items-center justify-center">
          <div className="bg-white dark:bg-[#182131] rounded-2xl  w-1/3 shadow-xl p-8">
            <div className="flex sm:items-center justify-between flex-col items-start sm:flex-row gap-4 mb-6">
              <h2 className="text-2xl font-bold dark:text-white/90 text-gray-900">
                {selectedFaq ? "Edit Plan" : "Create New Plan"}
              </h2>

              <div
                onClick={() => {
                  setShowPopup(false);
                  setSelectedFaq(null);
                  setFaqData({
                    question: "",
                    answer: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </div>
            </div>

            <div className="grid md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium dark:text-white/90 text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={selectedFaq ? (selectedFaq?.category || "course") : (faqData?.category || "course")}
                  onChange={(e) =>
                    selectedFaq
                      ? setSelectedFaq({
                          ...selectedFaq,
                          category: e.target.value,
                        })
                      : setFaqData({
                          ...faqData,
                          category: e.target.value,
                        })
                  }
                  className="w-full px-4 py-3 border dark:text-white/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="course">Course</option>
                  <option value="purchase">Purchase</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white/90 text-gray-700 mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={
                    selectedFaq ? selectedFaq?.question : faqData?.question
                  }
                  onChange={(e) =>
                    selectedFaq
                      ? setSelectedFaq({
                          ...selectedFaq,
                          question: e.target.value,
                        })
                      : setFaqData({
                          ...faqData,
                          question: e.target.value,
                        })
                  }
                  className="w-full px-4 py-3 border dark:text-white/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white/90 text-gray-700 mb-2">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  type="text"
                  required
                  value={selectedFaq ? selectedFaq?.answer : faqData?.answer}
                  onChange={(e) =>
                    selectedFaq
                      ? setSelectedFaq({
                          ...selectedFaq,
                          answer: e.target.value,
                        })
                      : setFaqData({
                          ...faqData,
                          answer: e.target.value,
                        })
                  }
                  className="w-full px-4 py-3 border dark:text-white/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter the answer"
                />
              </div>
            </div>
            <div className="mt-4 flex cursor-pointer gap-3">
              <div
                onClick={() => deleteFaq(selectedFaq?._id)}
                // disabled={selectedFaq ? false : !faqData.question}
                className="flex-1 cursor-pointer bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Trash className="w-5 h-5" />
                Delete FAQ
              </div>
            </div>
            <div className="mt-4 cursor-pointer flex gap-3">
              <div
                onClick={() => handelAddPlan()}
                // disabled={selectedFaq ? false : !faqData.question}
                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {selectedFaq ? "Update FAQ" : "Create FAQ"}
              </div>
            </div>
          </div>{" "}
        </div>
      )}
      <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-sm p-6">
        {" "}
        <div className="flex  items-start justify-between mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-white/90 gap-2">
            <CircleHelp className="w-5 h-5 text-blue-600" />
            FAQ'S
          </h2>
          <button
            type="button"
            onClick={() => setShowPopup(true)}
            className="px-4 py-2 flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <div className="space-y-4">
          {allFaqs.length > 0 ? (
            allFaqs.map((faq, index) => (
              <div key={faq?._id || index} className="px-4 py-3 flex border-2 gap-4 border-black/10 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">{index + 1}.</h2>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-2 dark:text-white/90">
                    {faq.question || "Question not available"}
                  </h2>
                  <p className="dark:text-white/70">{faq.answer || "Answer not available"}</p>
                </div>

                <div
                  onClick={() => {
                    setShowPopup(true);
                    setSelectedFaq(faq);
                    setFaqData({
                      question: faq.question,
                      answer: faq.answer,
                      category: faq.category || "course",
                    });
                  }}
                >
                  <Pen className="w-4 h-4 text-blue-600 mt-2 cursor-pointer" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center dark:text-white/70 py-6">
              <p>No FAQs available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Faqs;
