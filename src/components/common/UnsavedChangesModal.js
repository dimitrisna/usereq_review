import React from 'react';

/**
 * Modal shown when there are unsaved changes
 * @param {function} onSave - Callback when Save button is clicked
 * @param {function} onDiscard - Callback when Discard button is clicked
 * @param {function} onCancel - Callback when Cancel button is clicked
 */
const UnsavedChangesModal = ({ onSave, onDiscard, onCancel }) => {
  console.log('[UnsavedChangesModal] Rendering modal');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full border-l-4 border-blue-500">
        <div className="text-xl font-bold mb-4 text-gray-800">Unsaved Changes</div>
        <p className="mb-6 text-gray-600">You have unsaved changes that will be lost if you don't save them.</p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors font-medium"
            onClick={() => {
              console.log('[UnsavedChangesModal] Cancel clicked');
              onCancel();
            }}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            onClick={() => {
              console.log('[UnsavedChangesModal] Discard clicked');
              onDiscard();
            }}
          >
            Discard Changes
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            onClick={() => {
              console.log('[UnsavedChangesModal] Save clicked');
              onSave();
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;