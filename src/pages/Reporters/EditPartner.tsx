import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPartnerById, updatePartner } from "../../store/slices/partners";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import PopupAlert from "../../components/popUpAlert";

const EditPartner: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { partnerDetails, loading, error } = useAppSelector((state: any) => state.partners);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [popup, setPopup] = useState({
        message: "",
        type: "success" as "success" | "error",
        isVisible: false,
    });

    useEffect(() => {
        if (id) {
            dispatch(fetchPartnerById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (partnerDetails) {
            const names = (partnerDetails.fullName || "").split(" ");
            setFirstName(names[0] || "");
            setLastName(names.slice(1).join(" ") || "");
            setEmail(partnerDetails.email || "");
            setReferralCode(partnerDetails.referralCode || "");
        }
    }, [partnerDetails]);

    const generateReferralCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setReferralCode(result);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            fullName: firstName + " " + lastName,
            referralCode,
            // Email usually shouldn't be changed easily as it's the ID, but let's allow if backend supports
            // email, 
            phone: partnerDetails?.phone // preserve other fields if needed
        };

        try {
            await dispatch(updatePartner({ id: id!, data: payload })).unwrap();
            setPopup({
                message: "Partner updated successfully!",
                type: "success",
                isVisible: true,
            });
            setTimeout(() => {
                navigate("/partners/list"); // or whatever key URL
            }, 1000);
        } catch (err: any) {
            setPopup({
                message: err || "Failed to update partner.",
                type: "error",
                isVisible: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <PageMeta title="Edit Partner | TailAdmin" description="Edit Partner Details" />
            <PageBreadcrumb pageTitle="Edit Partner" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        Edit Partner Details
                    </h2>
                </div>

                {loading && !partnerDetails ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Email - Read Only mainly */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address (Cannot be changed)
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                                />
                            </div>

                            {/* Referred By */}
                            {partnerDetails?.referredByPartner && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Referred By
                                    </label>
                                    <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                            {partnerDetails.referredByPartner.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {partnerDetails.referredByPartner.fullName}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {partnerDetails.referredByPartner.email} • Code: {partnerDetails.referredByPartner.referralCode}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Referral Code */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Referral Code
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white uppercase tracking-wider"
                                        placeholder="CODE123"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateReferralCode}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Generate
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <PopupAlert
                message={popup.message}
                type={popup.type}
                isVisible={popup.isVisible}
                onClose={() => setPopup({ ...popup, isVisible: false })}
            />
        </div>
    );
};

export default EditPartner;
