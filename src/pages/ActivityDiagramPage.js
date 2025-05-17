import React from 'react';
import ReviewPage from '../components/review/ReviewPage';
import { getActivityDiagramsReviewData, submitReview, saveGeneralComment } from '../services/api';

// Define the criteria for activity diagrams
const activityDiagramCriteria = [
  {
    name: "Flow Logic",
    key: "flowLogicScore",
    description: "Correctly shows the flow of activities"
  },
  {
    name: "Decision Points",
    key: "decisionPointsScore",
    description: "Properly represents decision points and conditions"
  },
  {
    name: "Parallel Activities",
    key: "parallelActivitiesScore",
    description: "Correctly shows concurrent activities"
  },
  {
    name: "Start/End Points",
    key: "startEndPointsScore",
    description: "Clear entry and exit points"
  },
  {
    name: "Clarity",
    key: "clarityScore",
    description: "Easy to follow and understand"
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