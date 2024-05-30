import React from "react";
import { Button } from "react-bootstrap";
import { faSearch, faBookReader } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "bootstrap/dist/css/bootstrap.min.css";
import HeroHeader from "./HeroHeader";
import "./ExamPage.css";
import SelectExam from "./SelectExam";

function ExamPage() {
  const ExamPageHeroHeader = () => (
    <HeroHeader>
      <h1 className="display-4">
        <FontAwesomeIcon icon={faBookReader} className="me-2" /> Discover Your
        Subjects
      </h1>
      <p className="lead">
        Embark on a journey of knowledge. Choose your subject and challenge
        yourself!
      </p>
      {/* <Button variant="outline-light" className="mt-3">
        <FontAwesomeIcon icon={faSearch} className="me-2" />
        Explore Subjects
      </Button> */}
    </HeroHeader>
  );

  return (
    <div className="exam-page-bg" style={{ marginTop: "" }}>
      <ExamPageHeroHeader />
      <SelectExam />
    </div>
  );
}

export default ExamPage;
