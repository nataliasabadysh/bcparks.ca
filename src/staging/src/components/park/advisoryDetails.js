import React, { useState } from "react"
import PropTypes from "prop-types"
import { parseJSON, format } from "date-fns"
import "../../styles/cmsSnippets/advisoryDetails.scss"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Accordion from "react-bootstrap/Accordion"
import Container from "react-bootstrap/Container"
import Heading from "./heading"
import HtmlContent from "./htmlContent"

import blueAlertIcon from "../../images/park/blue-alert-64.png"
import yellowAlertIcon from "../../images/park/yellow-alert-64.png"
import redAlertIcon from "../../images/park/red-alert-64.png"

const formatDate = (isoDate) => {
  return isoDate ? format(parseJSON(isoDate), "MMMM dd, yyyy") : ""
}

export default function AdvisoryDetails({ advisories }) {

  let expandedsInitial = []
  advisories.forEach((advisory, index) => {
    expandedsInitial[index] = false
  })

  const [allExpanded, setAllExpanded] = useState(false)
  const [expandeds, setExpandeds] = useState(expandedsInitial)

  const handleChange = id => {
    expandeds[id] = !expandeds[id]
    setExpandeds([...expandeds])
  }

  const expandAll = isAllExpanded => {
    let expandeds = []
    advisories.forEach((advisory, index) => {
      expandeds[index] = isAllExpanded
    })
    setExpandeds(expandeds)
  }

  const advisoriesWithFormatting = advisories.map(advisory => {
    let alertIcon
    let alertColorCss

    switch (advisory.urgency.color) {
      case "blue":
        alertIcon = blueAlertIcon
        alertColorCss = "blue-alert"
        break
      case "red":
        alertIcon = redAlertIcon
        alertColorCss = "red-alert"
        break
      case "yellow":
        alertIcon = yellowAlertIcon
        alertColorCss = "yellow-alert"
        break
      default:
        alertIcon = blueAlertIcon
        alertColorCss = "blue-alert"
    }

    return {
      alertIcon,
      alertColorCss,
      formattedAdvisoryDate: formatDate(advisory.advisoryDate),
      formattedEffectiveDate: formatDate(advisory.effectiveDate),
      formattedEndDate: formatDate(advisory.endDate),
      ...advisory
    }
  })

  return (
    <div className="mb-5">
      <Row className="anchor-link" id="park-advisory-details-container">
        <Col >
          <div className="d-flex justify-content-between align-items-flex-start">
            <Heading>{`Advisories (${advisories.length})`}</Heading>
            <div>
              {advisories.length > 1 && (
                <Button
                  className="btn btn-outline-primary expand-button"
                  onClick={() => {
                    expandAll(!allExpanded)
                    setAllExpanded(!allExpanded)
                  }}>
                  {allExpanded ? "[collapse all]" : "[expand all]"}
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        {advisories.length === 0 && (
          <Col>
            <HtmlContent>There are no reported advisories for this park</HtmlContent>
          </Col>
        )}
        {advisories.length > 0 && (
          <Col>
            {advisoriesWithFormatting.map((advisory, index) => (
              <Accordion
                // React bootstrap accordions are designed to only have 1 item open at a time.
                // To allow multiple open at the same time, each item must be in its own accordion with only 1 element in it.
                // The following assigns each item its own activeKey IFF the item accordion is 'open'.
                // Otherwise the activeKey is set to null, effectively removing the 'open' state from the accordion.
                // This is a cheeky way to programmatically open one, some, or all items simultaneously.
                activeKey={expandeds[index] ? advisory.id : null}
                aria-controls={advisory.title}
                className="mb-4">
                <Accordion.Toggle as={Container} className="accordion-toggle" onClick={() => {
                  handleChange(index);
                }}
                  eventKey={advisory.id}>
                  <div className="d-flex justify-content-between">
                    <div className="d-inline-flex align-items-start">
                      <img
                        src={advisory.alertIcon}
                        className="small mr-3"
                        alt="Alert icon"
                      >
                      </img>
                      <HtmlContent>{advisory.title}</HtmlContent>
                    </div>
                    <div className="d-flex align-items-center expand-icon">
                      <i className={(expandeds[index] ? "open " : "close ") + "fa fa-angle-down mx-3"}></i>
                    </div>
                  </div>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={advisory.id}>
                  <div className="advisory-content p-3">
                    {advisory.description &&
                      <HtmlContent className="mb-2">{advisory.description}</HtmlContent>
                    }
                    {advisory.isEffectiveDateDisplayed &&
                      advisory.formattedEffectiveDate && (
                        <>
                          <br />
                          <p>
                            In effect {advisory.formattedEffectiveDate}
                            {advisory.isEndDateDisplayed && advisory.formattedEndDate && (
                              <>
                                {" to "}
                                {advisory.formattedEndDate}
                              </>
                            )}
                          </p>
                        </>
                      )}
                    {advisory.isAdvisoryDateDisplayed &&
                      advisory.formattedAdvisoryDate && (
                        <>
                          <br />
                          <p>Posted {advisory.formattedAdvisoryDate}</p>
                        </>
                      )}
                    <br />
                    <hr></hr>
                  </div>
                </Accordion.Collapse>
              </Accordion>
            ))}
          </Col>
        )}
      </Row>
    </div>
  )
}

AdvisoryDetails.propTypes = {
  advisories: PropTypes.array.isRequired,
};
