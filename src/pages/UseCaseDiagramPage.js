import React from 'react';
import ReviewPage from '../components/review/ReviewPage';
import { getUseCaseDiagramsReviewData, submitReview, saveGeneralComment } from '../services/api';

// Define the criteria for use case diagrams
const useCaseDiagramCriteria = [
  {
    name: "Actor Identification",
    key: "actorIdentificationScore",
    description: "Correctly identifies external actors"
  },
  {
    name: "Use Case Definition",
    key: "useCaseDefinitionScore",
    description: "Use cases represent valuable user goals"
  },
  {
    name: "Relationships",
    key: "relationshipsScore",
    description: "Proper use of include/extend relationships"
  },
  {
    name: "System Boundary",
    key: "systemBoundaryScore",
    description: "Clear system boundaries"
  },
  {
    name: "Completeness",
    key: "completenessScore",
    description: "Covers all user interactions with the system"
  }
];

const UseCaseDiagramsPage = () => {
  return (
    <ReviewPage
      artifactType="useCaseDiagrams"
      fetchReviewData={getUseCaseDiagramsReviewData}
      submitReviewFn={submitReview}
      saveGeneralCommentFn={saveGeneralComment}
      criteriaDefinitions={useCaseDiagramCriteria}
      pageTitle="Use Case Diagrams Review"
    />
  );
};

export default UseCaseDiagramsPage;