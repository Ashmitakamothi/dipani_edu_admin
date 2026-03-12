import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchPageBanner, fetchAllPageBanners, updatePageBanner, bulkUpdatePageBanners, PageBannerData } from "../../store/slices/banner";
import { 
  Save, 
  Image as ImageIcon, 
  Type, 
  Link as LinkIcon, 
  BadgeInfo,
  Sparkles,
  Upload,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";

const PAGES = [
  { key: "courses", label: "Courses" },
  { key: "ebooks", label: "Ebooks" },
  { key: "career", label: "Career" },
  { key: "services", label: "Services" },
];

const initialData: PageBannerData = {
  badge: { text: "New Release", iconName: "Sparkles" },
  title: { main: "Transform Your Future", accent: "Skill Up", sub: "Join 10,000+ Students Today" },
  description: "Comprehensive courses designed by industry experts to help you master the latest technologies and advance your career.",
  primaryCTA: { text: "Browse Courses", link: "/courses" },
  secondaryCTA: { text: "Learn More", link: "/about" },
  image: { src: "", alt: "Hero Banner" },
  tags: { top: "100+ Courses", bottom: "Lifetime Access" }
};

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:3001/uploads";

const BannerManagementContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pageBanners, loading } = useAppSelector((state) => state.banner);
  const [activePage, setActivePage] = useState("courses");
  
  // Entire form state, keyed by pageKey. 
  // Initialize ALL tabs with default/initial data immediately.
  const [pagesState, setPagesState] = useState<Record<string, PageBannerData>>(() => {
    const initialState: Record<string, PageBannerData> = {};
    PAGES.forEach(page => {
      initialState[page.key] = { 
        ...JSON.parse(JSON.stringify(initialData)), 
        pageKey: page.key 
      };
    });
    return initialState;
  });
  
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string | null>>({});
  const [isDirty, setIsDirty] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statesInitialized = useRef<Record<string, boolean>>({});

  useEffect(() => {
    // Fetch all page banners on mount
    dispatch(fetchAllPageBanners());
  }, [dispatch]);

  // Sync server data to local state
  useEffect(() => {
    setPagesState(prev => {
      const next = { ...prev };
      let changed = false;
      
      PAGES.forEach(page => {
        const serverData = pageBanners[page.key];
        
        // SYNC LOGIC:
        // We sync if we have server data AND:
        // 1. We haven't successfully synced this tab yet.
        // 2. OR the local tab has no _id (it's new) but the server HAS data for it.
        // BUT, only if the user hasn't "dirtied" the tab.
        
        const hasId = !!prev[page.key]._id;
        const needsSync = !statesInitialized.current[page.key] || (!hasId && serverData);

        if (serverData && needsSync && !isDirty[page.key]) {
          console.log(`[SYNC] Updating ${page.key} with server data:`, serverData.image?.src);
          next[page.key] = { ...serverData, pageKey: page.key };
          statesInitialized.current[page.key] = true;
          changed = true;
        }
      });
      
      return changed ? next : prev;
    });
  }, [pageBanners, isDirty]);

  const activeData = pagesState[activePage];

  const handleInputChange = (section: keyof PageBannerData | "description", field: string, value: string) => {
    setIsDirty(prev => ({ ...prev, [activePage]: true }));
    setPagesState(prev => {
      const pageData = prev[activePage];
      
      if (section === "description") {
        return {
          ...prev,
          [activePage]: { ...pageData, description: value }
        };
      }

      const sectionData = pageData[section as keyof PageBannerData];
      
      return {
        ...prev,
        [activePage]: {
          ...pageData,
          [section]: typeof sectionData === 'object' && sectionData !== null
            ? { ...sectionData, [field]: value }
            : value
        }
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`[FILE] Selected for ${activePage}: ${file.name}`);
      setIsDirty(prev => ({ ...prev, [activePage]: true }));
      setSelectedFiles(prev => ({ ...prev, [activePage]: file }));
      setPreviewUrls(prev => {
        if (prev[activePage]) URL.revokeObjectURL(prev[activePage]!);
        return { ...prev, [activePage]: URL.createObjectURL(file) };
      });
    }
  };

  const removeFile = () => {
    setIsDirty(prev => ({ ...prev, [activePage]: true }));
    if (previewUrls[activePage]) {
      URL.revokeObjectURL(previewUrls[activePage]!);
    }
    setPreviewUrls(prev => ({ ...prev, [activePage]: null }));
    setSelectedFiles(prev => ({ ...prev, [activePage]: null }));
    
    setPagesState(prev => {
      const currentPageData = prev[activePage];
      return {
        ...prev,
        [activePage]: {
          ...currentPageData,
          image: { ...currentPageData.image, src: "" }
        }
      };
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    const formData = new FormData();
    const bannersToSave: PageBannerData[] = [];

    console.log("[BULK SAVE] PAGES Status:", PAGES.map(p => ({
        key: p.key,
        hasState: !!pagesState[p.key],
        imageSrc: pagesState[p.key]?.image?.src || "NONE"
    })));

    // Validation & Collection for ALL 4 tabs
    for (const page of PAGES) {
      const data = pagesState[page.key];
      const hasLocalFile = !!selectedFiles[page.key];
      const hasServerFile = !!data?.image?.src;

      // Skip validation for absolutely uninitialized tabs if we want, 
      // but here we initialized them all, so we check images for all.
      if (!hasLocalFile && !hasServerFile) {
        setActivePage(page.key);
        toast.error(`Please upload a hero banner for the ${page.label} page.`);
        return;
      }

      bannersToSave.push(data);
      if (hasLocalFile) {
        formData.append(`file_${page.key}`, selectedFiles[page.key]!);
      }
    }

    console.log(`[BULK SAVE] Sending ${bannersToSave.length} banners:`, bannersToSave.map(b => b.pageKey));
    formData.append("banners", JSON.stringify(bannersToSave));

    try {
      const response = await dispatch(bulkUpdatePageBanners(formData)).unwrap();
      toast.success("✅ All changes saved successfully!");
      
      // Update local state and clear files
      if (Array.isArray(response)) {
        const newState: Record<string, PageBannerData> = {};
        response.forEach((b: any) => {
          if (b.pageKey) newState[b.pageKey] = b;
        });
        setPagesState(prev => ({ ...prev, ...newState }));
      }

      // Clear all local file states and dirty flags
      setIsDirty({});
      setSelectedFiles({});
      Object.keys(previewUrls).forEach(key => {
        if (previewUrls[key]) URL.revokeObjectURL(previewUrls[key]!);
      });
      setPreviewUrls({});
      
    } catch (err: any) {
      console.error("[BULK SAVE ERROR]:", err);
      toast.error(err || "Save failed");
    }
  };

  const displayImageSrc = previewUrls[activePage] || (activeData.image.src ? `${IMAGE_URL}/${activeData.image.src}` : null);

  return (
    <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <PageMeta title="Page Banner Manager | Admin" description="Manage hero banners across the website" />
      <PageBreadcrumb pageTitle="Page Banner Manager" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-12 mx-auto flex flex-col gap-6 w-full">
          {/* Action Bar */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Page Management</h3>
              <p className="text-sm text-gray-500">Currently Editing: <span className="text-brand-500 font-semibold">{PAGES.find(p => p.key === activePage)?.label}</span></p>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-brand-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-brand-500/30 hover:bg-brand-600 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
              Save All Changes
            </button>
          </div>

          {/* Tab Selector */}
          <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex gap-2 overflow-x-auto no-scrollbar">
            {PAGES.map((page) => (
              <button
                key={page.key}
                onClick={() => setActivePage(page.key)}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activePage === page.key
                    ? "bg-brand-500 text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Badge Area */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-brand-500 font-semibold text-lg">
                  <BadgeInfo className="w-5 h-5" />
                  <h3>Badge Configuration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Badge Text</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                      value={activeData.badge.text}
                      onChange={(e) => handleInputChange("badge", "text", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Icon Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                      value={activeData.badge.iconName}
                      onChange={(e) => handleInputChange("badge", "iconName", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Title Area */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-brand-500 font-semibold text-lg">
                  <Type className="w-5 h-5" />
                  <h3>Title & Text</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Main Title"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none transition-all dark:text-white"
                        value={activeData.title.main}
                        onChange={(e) => handleInputChange("title", "main", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Accent Title"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none transition-all dark:text-white italic"
                        value={activeData.title.accent}
                        onChange={(e) => handleInputChange("title", "accent", e.target.value)}
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Sub Title"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none transition-all dark:text-white"
                    value={activeData.title.sub}
                    onChange={(e) => handleInputChange("title", "sub", e.target.value)}
                  />
                  <textarea
                    rows={3}
                    placeholder="Description"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none transition-all dark:text-white resize-none"
                    value={activeData.description}
                    onChange={(e) => handleInputChange("description", "", e.target.value)}
                  />
                </div>
              </div>

              {/* CTAs */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-brand-500 font-semibold text-lg">
                  <LinkIcon className="w-5 h-5" />
                  <h3>Call to Actions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primary Button</h4>
                    <input
                      type="text"
                      placeholder="Label"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none transition-all dark:text-white"
                      value={activeData.primaryCTA.text}
                      onChange={(e) => handleInputChange("primaryCTA", "text", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Link"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none transition-all dark:text-white"
                      value={activeData.primaryCTA.link}
                      onChange={(e) => handleInputChange("primaryCTA", "link", e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Secondary Button</h4>
                    <input
                      type="text"
                      placeholder="Label"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none transition-all dark:text-white"
                      value={activeData.secondaryCTA.text}
                      onChange={(e) => handleInputChange("secondaryCTA", "text", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Link"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none transition-all dark:text-white"
                      value={activeData.secondaryCTA.link}
                      onChange={(e) => handleInputChange("secondaryCTA", "link", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-brand-500 font-semibold text-lg">
                  <ImageIcon className="w-5 h-5" />
                  <h3>Hero Media</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-4 min-h-[160px] flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 overflow-hidden">
                      {displayImageSrc ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                          <img src={displayImageSrc} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={removeFile}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center gap-2 cursor-pointer group"
                        >
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5 text-brand-500" />
                          </div>
                          <span className="text-xs font-semibold text-gray-500">Upload Banner</span>
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Alt Text"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none transition-all dark:text-white"
                      value={activeData.image.alt}
                      onChange={(e) => handleInputChange("image", "alt", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Top Tag"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none transition-all dark:text-white"
                        value={activeData.tags.top}
                        onChange={(e) => handleInputChange("tags", "top", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Bottom Tag"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none transition-all dark:text-white"
                        value={activeData.tags.bottom}
                        onChange={(e) => handleInputChange("tags", "bottom", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BannerManagementContent;
