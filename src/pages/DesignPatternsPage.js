import React from 'react';
import ReviewPage from '../components/review/ReviewPage';
import { getDesignPatternsReviewData, submitReview, saveGeneralComment } from '../services/api';

// Define the criteria for design patterns
const designPatternCriteria = [
  {
    name: "Pattern Selection",
    key: "patternSelectionScore",
    description: "Appropriate choice of design pattern for the problem being solved"
  },
  {
    name: "Implementation",
    key: "implementationScore",
    description: "Correct implementation of the design pattern structure and principles"
  },
  {
    name: "Flexibility",
    key: "flexibilityScore",
    description: "Solution is flexible, extensible and adaptable to changes"
  },
  {
    name: "Documentation",
    key: "documentationScore",
    description: "Clear documentation explaining the pattern usage and implementation"
  }
];

const DesignPatternsPage = () => {
  return (
    <ReviewPage
      artifactType="designPatterns"
      fetchReviewData={getDesignPatternsReviewData}
      submitReviewFn={submitReview}
      saveGeneralCommentFn={saveGeneralComment}
      criteriaDefinitions={designPatternCriteria}
      pageTitle="Design Patterns Review"
    />
  );
};

export default DesignPatternsPage;