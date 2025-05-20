// components/review/ReviewCriteriaRubric.js
import React from 'react';
import StarRating from '../common/StarRating';

/**
 * Component to display rubric criteria and their average scores
 * @param {Array} criteria - Array of criteria definitions
 * @param {Object} aggregateScores - Aggregated scores for each criterion
 * @param {number} overallScore - Overall score for the rubric
 */
const ReviewCriteriaRubric = ({ criteria, aggregateScores, overallScore = 0 }) => {
    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
                <div className="mb-4">
                    <h2 className="text-xl font-bold">Rubric Evaluation</h2>
                    <div className="mt-1 flex items-center">
                        <StarRating value={Math.round(overallScore * 2) / 2} allowHalf={true} />
                        <span className="ml-2 text-gray-600">{overallScore.toFixed(1)}/5</span>
                    </div>
                </div>

                <div className="space-y-4 mb-4">
                    {criteria.map((criterion, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors">
                            <div className="flex justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold">{criterion.name}</h3>
                                    <p className="text-gray-600 text-sm">{criterion.description}</p>
                                </div>
                                <StarRating
                                    value={Math.round((aggregateScores?.[criterion.key] || 0) * 2) / 2}
                                    allowHalf={true}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewCriteriaRubric;