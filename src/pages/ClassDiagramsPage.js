import React from 'react';
import ReviewPage from '../components/review/ReviewPage';
import { getClassDiagramsReviewData, submitReview, saveGeneralComment } from '../services/api';

// Define the criteria for class diagrams
const classDiagramCriteria = [
  {
    name: "Class Structure",
    key: "classStructureScore",
    description: "Appropriate use of classes, attributes, methods"
  },
  {
    name: "Relationship Modeling",
    key: "relationshipModelingScore",
    description: "Appropriate associations, inheritance, composition"
  },
  {
    name: "Completeness",
    key: "completenessScore",
    description: "Covers all required functionality"
  },
  {
    name: "Clarity",
    key: "clarityScore",
    description: "Naming and organization are clear and consistent"
  },
  {
    name: "Design Principles",
    key: "designPrinciplesScore",
    description: "Follows OOP principles (encapsulation, etc.)"
  }
];

const ClassDiagramsPage = () => {
  return (
    <ReviewPage
      artifactType="classDiagrams"
      fetchReviewData={getClassDiagramsReviewData}
      submitReviewFn={submitReview}
      saveGeneralCommentFn={saveGeneralComment}
      criteriaDefinitions={classDiagramCriteria}
      pageTitle="Class Diagrams Review"
    />
  );
};

export default ClassDiagramsPage;