// components/review/ArtifactTable.js
import React from 'react';
import StarRating from '../common/StarRating';

/**
 * Generic table component for displaying artifacts with their review status
 * @param {Array} artifacts - Array of artifacts to display
 * @param {function} onReview - Callback when the Review button is clicked
 * @param {string} artifactName - Name of the artifact type (singular)
 * @param {boolean} isAdmin - Whether the current user has admin privileges
 */
const ArtifactTable = ({ artifacts, onReview, artifactName = "artifact", isAdmin = false }) => {
    if (!artifacts || artifacts.length === 0) {
        return (
            <div className="text-center py-10">
                <p>No {artifactName}s found for this project.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {artifacts.map(artifact => (
                        <tr key={artifact._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                                    onClick={() => onReview(artifact)}
                                >
                                    {artifact.title}
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${artifact.reviewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {artifact.reviewed ? 'Reviewed' : 'Pending'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {artifact.reviewed ? <StarRating value={Math.round(artifact.rating * 2) / 2} allowHalf={true} readOnly={true} /> : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm"
                                    onClick={() => onReview(artifact)}
                                >
                                    {isAdmin
                                        ? (artifact.reviewed ? 'Edit Review' : 'Review')
                                        : 'View Review'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ArtifactTable;