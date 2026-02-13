import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createModule } from '../../store/slices/module';
import { BookOpen, Save, Loader2, ArrowRight } from 'lucide-react';

const ModuleCreationForm = ({ onModuleCreated, courseId }) => {
    const dispatch = useDispatch();
    const { loading: moduleLoading } = useSelector((state) => state.module);
    
    const [moduleData, setModuleData] = useState({
        title: '',
        description: '',
        order: 1,
        estimatedDuration: 60,
        isPublished: false
    });
    
    const [isSaving, setIsSaving] = useState(false);

    const handleCreateModule = async () => {
        if (!moduleData.title.trim()) {
            alert('Please enter a module title');
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('token') || '';
            const payload = {
                courseId,
                title: moduleData.title,
                description: moduleData.description,
                order: moduleData.order,
                estimatedDuration: moduleData.estimatedDuration,
                isPublished: moduleData.isPublished,
                token
            };

            const result = await dispatch(createModule(payload)).unwrap();
            onModuleCreated(result.data);
            
            // Reset form
            setModuleData({
                title: '',
                description: '',
                order: 1,
                estimatedDuration: 60,
                isPublished: false
            });
        } catch (error) {
            console.error('Error creating module:', error);
            alert('Failed to create module. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Create New Module</h3>
                <p className="text-gray-600">First, create your module. Then you'll be able to add lessons to it.</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Module Title *
                    </label>
                    <input
                        type="text"
                        value={moduleData.title}
                        onChange={e => setModuleData({ ...moduleData, title: e.target.value })}
                        placeholder="e.g., Introduction to React Basics"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Module Description
                    </label>
                    <textarea
                        value={moduleData.description}
                        onChange={e => setModuleData({ ...moduleData, description: e.target.value })}
                        placeholder="Describe what students will learn in this module..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        rows={4}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Duration (minutes)
                        </label>
                        <input
                            type="number"
                            value={moduleData.estimatedDuration}
                            onChange={e => setModuleData({ ...moduleData, estimatedDuration: parseInt(e.target.value) || 60 })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            min="1"
                            placeholder="60"
                        />
                    </div>
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Module Order
                        </label>
                        <input
                            type="number"
                            value={moduleData.order}
                            onChange={e => setModuleData({ ...moduleData, order: parseInt(e.target.value) || 1 })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            min="1"
                        />
                    </div> */}
                </div>

                {/* <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isPublished"
                        checked={moduleData.isPublished}
                        onChange={e => setModuleData({ ...moduleData, isPublished: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isPublished" className="text-gray-700 font-medium">
                        Publish module immediately
                    </label>
                </div> */}

                <div className="pt-6">
                    <button
                        onClick={handleCreateModule}
                        disabled={isSaving || !moduleData.title.trim()}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-semibold"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Module...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Create Module
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModuleCreationForm;