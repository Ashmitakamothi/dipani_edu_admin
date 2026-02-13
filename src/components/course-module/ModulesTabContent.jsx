import React, { useState } from 'react';
import { BookOpen, CheckCircle, Users, Plus, Loader2, Pencil } from 'lucide-react';
import EditModulePopup from './EditModulePopup';

const ModulesTabContent = ({ 
    totalModules, 
    publishedModules, 
    totalLessons, 
    showCreateForm, 
    ModuleCreationForm, 
    handleModuleCreated, 
    courseId, 
    courseData,
    savedModules, 
    SavedModuleDisplay, 
    addLessonToModule, 
    updateLessonInModule, 
    removeLessonFromModule, 
    moduleLoading, 
    moduleError, 
    setShowCreateForm,
    isEditing = false
}) => {
    const [editModule, setEditModule] = useState(null);

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Modules</p>
                            <p className="text-2xl font-bold text-gray-900">{totalModules}</p>
                        </div>
                    </div>
                </div>
                {/* <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Published Modules</p>
                            <p className="text-2xl font-bold text-gray-900">{publishedModules}</p>
                        </div>
                    </div>
                </div> */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Users className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                            <p className="text-2xl font-bold text-gray-900">{totalLessons}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Module Creation Form */}
            {showCreateForm && (
                <div className="mb-6">
                    <ModuleCreationForm
                        onModuleCreated={handleModuleCreated}
                        courseId={courseId}
                    />
                </div>
            )}

            {/* Saved Modules Display */}
            <div className="space-y-6">
                {savedModules.map((module, index) => (
                    <div key={module._id || index} className="relative">
                        {/* Edit Icon */}
                        <button
                            className="absolute top-2 right-2 z-10 p-2 rounded-full hover:bg-blue-100 transition"
                            title="Edit Module"
                            onClick={() => setEditModule(module)}
                        >
                            <Pencil className="w-5 h-5 text-blue-600" />
                        </button>
                        <SavedModuleDisplay
                            module={module}
                            courseId={courseId}
                            courseData={courseData}
                            onAddLesson={(newLesson) => addLessonToModule(index, newLesson)}
                            onLessonChange={(lessonIndex, updatedLesson) => updateLessonInModule(index, lessonIndex, updatedLesson)}
                            onLessonRemove={(lessonIndex) => removeLessonFromModule(index, lessonIndex)}
                            isEditing={isEditing}
                        />
                    </div>
                ))}

                {moduleLoading && (
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="mt-4 text-gray-600">Loading modules...</p>
                    </div>
                )}

                {moduleError && (
                    <div className="text-red-600 text-center py-8">
                        <p>Error loading modules: {moduleError.message}</p>
                    </div>
                )}

                {savedModules.length === 0 && !moduleLoading && !moduleError && !showCreateForm && (
                    <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No modules created yet!</h4>
                        <p className="text-gray-600 mb-4">Start by creating your first module.</p>
                        <button
                            type="button"
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 mx-auto"
                        >
                            <Plus className="w-4 h-4" />
                            Create First Module
                        </button>
                    </div>
                )}
            </div>
            {/* Edit Module Popup */}
            {editModule && (
                <EditModulePopup
                    module={editModule}
                    courseId={courseId}
                    onClose={() => setEditModule(null)}
                    onModuleUpdated={handleModuleCreated}
                />
            )}
        </div>
    );
};

export default ModulesTabContent;