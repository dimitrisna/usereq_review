import React from 'react';
import ReviewPage from '../components/review/ReviewPage';
import { getClassDiagramsReviewData, submitReview, saveGeneralComment } from '../services/api';

// Define the criteria for class diagrams
const classDiagramCriteria = [
  {
    name: "Boundary Objects",
    key: "boundaryObjectsScore",
    description: "Attributes have scope/name/datatype, methods have return type/name/parameters. UI classes include event handlers. Proper relationships with other boundary objects."
  },
  {
    name: "Control Objects",
    key: "controlObjectsScore",
    description: "No attributes (except business logic). Contains only control-related methods (no UI event handlers, no setters/getters)."
  },
  {
    name: "Entity Objects",
    key: "entityObjectsScore",
    description: "Has proper attributes with corresponding getter/setter methods and appropriate data types. No other methods except getters/setters and constructors."
  },
  {
    name: "UML Notation",
    key: "umlNotationScore",
    description: "Correctly uses UML symbols, notations, and conventions in the class diagram."
  },
  {
    name: "Architectural Design",
    key: "architecturalDesignScore",
    description: "UI connects only with controllers, Proxies connect only with controllers, Entities connect only with controllers. No direct UI/Proxy to Entity connections."
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