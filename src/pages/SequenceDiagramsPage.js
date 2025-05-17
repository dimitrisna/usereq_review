import React from 'react';
import ReviewPage from '../components/review/ReviewPage';
import { getSequenceDiagramsReviewData, submitReview, saveGeneralComment } from '../services/api';

// Define the criteria for sequence diagrams
const sequenceDiagramCriteria = [
  {
    name: "Object Interaction",
    key: "objectInteractionScore",
    description: "Correctly shows interaction between objects"
  },
  {
    name: "Message Flow",
    key: "messageFlowScore",
    description: "Proper sequence of messages"
  },
  {
    name: "Return Values",
    key: "returnValuesScore",
    description: "Properly shows return values and responses"
  },
  {
    name: "Exception Handling",
    key: "exceptionHandlingScore",
    description: "Includes error scenarios"
  },
  {
    name: "Completeness",
    key: "completenessScore",
    description: "Covers all necessary interactions"
  }
];

const SequenceDiagramsPage = () => {
  return (
    <ReviewPage
      artifactType="sequenceDiagrams"
      fetchReviewData={getSequenceDiagramsReviewData}
      submitReviewFn={submitReview}
      saveGeneralCommentFn={saveGeneralComment}
      criteriaDefinitions={sequenceDiagramCriteria}
      pageTitle="Sequence Diagrams Review"
    />
  );
};

export default SequenceDiagramsPage;