import React from 'react';
import ReviewPage from '../components/review/ReviewPage';
import { getSequenceDiagramsReviewData, submitReview, saveGeneralComment } from '../services/api';

// Define the criteria for sequence diagrams
const sequenceDiagramCriteria = [
  {
    name: "Message Flow",
    key: "messageFlowScore",
    description: "Proper sequence of messages"
  },
  {
    name: "Completeness",
    key: "completenessScore",
    description: "Covers all necessary interactions"
  },
  {
    name: "UML Correctness",
    key: "umlCorrectnessScore",
    description: "Follows UML sequence diagram standards and notation"
  },
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