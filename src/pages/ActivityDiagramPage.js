import React from 'react';
import ReviewPage from '../components/review/ReviewPage';
import { getActivityDiagramsReviewData, submitReview, saveGeneralComment } from '../services/api';

// Define the criteria for activity diagrams
const activityDiagramCriteria = [
  {
    name: "UML Syntax",
    key: "umlSyntaxScore",
    description: "Activity diagrams have been created with correct UML syntax"
  },
  {
    name: "Scenario Coverage",
    key: "scenarioComprehensiveScore",
    description: "The activity diagram for each use case contains all its Gherkin scenarios"
  },
  {
    name: "Gherkin Alignment",
    key: "gherkinAlignmentScore",
    description: "The steps of each Gherkin scenario match with the activities in the corresponding flow in the activity diagram"
  }
];

const ActivityDiagramsPage = () => {
  return (
    <ReviewPage
      artifactType="activityDiagrams"
      fetchReviewData={getActivityDiagramsReviewData}
      submitReviewFn={submitReview}
      saveGeneralCommentFn={saveGeneralComment}
      criteriaDefinitions={activityDiagramCriteria}
      pageTitle="Activity Diagrams Review"
    />
  );
};

export default ActivityDiagramsPage;