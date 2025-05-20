import React from 'react';
import ReviewPage from '../components/review/ReviewPage';
import { getUseCaseDiagramsReviewData, submitReview, saveGeneralComment } from '../services/api';

// Define the criteria for use case diagrams
const useCaseDiagramCriteria = [
  {
    name: "UML Syntax",
    key: "umlSyntaxScore",
    description: "Use case diagrams have been created with correct UML syntax"
  },
  {
    name: "Use Case Package Definition",
    key: "useCasePackageScore",
    description: "A complete use case package has been defined for each use case in the diagrams"
  },
  {
    name: "Gherkin Specification",
    key: "gherkinSpecificationScore",
    description: "Each use case package adequately defines preconditions, triggers, and system responses for each Gherkin scenario"
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