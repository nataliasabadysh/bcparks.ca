import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import { sortBy } from "lodash"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import {
  Box,
  Container,
  Grid,
  CssBaseline,
  Link,
  Breadcrumbs,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import useScrollSpy from "react-use-scrollspy"

import { capitalizeFirstLetter, renderHTML } from "../utils/helpers";

import Footer from "../components/footer"
import Header from "../components/header"
import PageMenu from "../components/pageContent/pageMenu"

import About from "../components/park/about"
import AccessibilityDetails from "../components/park/accessibilityDetails"
import AdvisoryDetails from "../components/park/advisoryDetails"
import CampingDetails from "../components/park/campingDetails"
import Reconciliation from "../components/park/reconciliation"
import Heading from "../components/park/heading.js"
import ParkActivity from "../components/park/parkActivity"
import ParkDates from "../components/park/parkDates"
import ParkFacility from "../components/park/parkFacility"
import ParkHeader from "../components/park/parkHeader"
import ParkMapDetails from "../components/park/parkMapDetails"
import ParkOverview from "../components/park/parkOverview"
import ParkPhotoGallery from "../components/park/parkPhotoGallery"
import MapLocation from "../components/park/mapLocation"
import SafetyInfo from "../components/park/safetyInfo"
import ScrollToTop from "../components/scrollToTop"

import "../styles/parks.scss"
import { PARK_NAME_TYPE } from "../utils/constants";

const drawerWidth = 230

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
  },
  parkContent: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  appBarOffset: theme.mixins.toolbar,
}))

const loadAdvisories = async (apiBaseUrl, orcs) => {
  const params = {
    "protectedAreas.orcs_in": orcs,
    _limit: 100,
    _sort: "urgency.sequence:DESC",
  }

  return axios.get(`${apiBaseUrl}/public-advisories`, { params })
}

export default function ParkTemplate({ data }) {
  const classes = useStyles()

  const apiBaseUrl = data.site.siteMetadata.apiURL

  const park = data.strapiProtectedArea
  const photos = [...data.featuredPhotos.nodes, ...data.regularPhotos.nodes]
  const operations = park.parkOperation || {}

  const activeActivities = sortBy(
    park.parkActivities.filter(
      activity => activity.isActive && activity.activityType.isActive
    ),
    ["activityType.rank", "activityType.activityName"],
    ["asc"]
  )
  const activeFacilities = sortBy(
    park.parkFacilities.filter(
      facility => facility.isActive && facility.facilityType.isActive
    ),
    ["facilityType.rank", "facilityType.facilityName"],
    ["asc"]
  )

  const hasReservations = operations.hasReservations
  const hasDayUsePass = park.hasDayUsePass
  const hasCamping = activeFacilities.some(facility =>
    facility.facilityType.facilityName.toLowerCase().includes("camping")
  )

  const menuContent = data?.allStrapiMenus?.nodes || []

  const [advisoryLoadError, setAdvisoryLoadError] = useState(false)
  const [isLoadingAdvisories, setIsLoadingAdvisories] = useState(true)
  const [advisories, setAdvisories] = useState([])

  useEffect(() => {
    setIsLoadingAdvisories(true)

    loadAdvisories(apiBaseUrl, park.orcs)
      .then(response => {
        if (response.status === 200) {
          setAdvisories([...response.data])
          setAdvisoryLoadError(false)
        } else {
          setAdvisories([])
          setAdvisoryLoadError(true)
        }
      })
      .finally(() => {
        setIsLoadingAdvisories(false)
      })
  }, [apiBaseUrl, park.orcs])

  const parkOverviewRef = useRef("")
  const accessibilityRef = useRef("")
  const advisoryRef = useRef("")
  const parkDatesRef = useRef("")
  const safetyRef = useRef("")
  const campingRef = useRef("")
  const facilityRef = useRef("")
  const activityRef = useRef("")
  const mapLocationRef = useRef("")
  const activityMapRef = useRef("")
  const aboutRef = useRef("")
  const reconciliationRef = useRef("")

  const sectionRefs = [
    parkOverviewRef,
    accessibilityRef,
    advisoryRef,
    parkDatesRef,
    safetyRef,
    campingRef,
    facilityRef,
    activityRef,
    mapLocationRef,
    activityMapRef,
    aboutRef,
    reconciliationRef,
  ]

  const activeSection = useScrollSpy({
    sectionElementRefs: sectionRefs,
    defaultValue: 0,
    offsetPx: -250,
  })

  const menuItems = [
    {
      sectionIndex: 0,
      display: capitalizeFirstLetter(`${park.type} overview`),
      link: "#park-overview-container",
      visible: true,
    },
    {
      sectionIndex: 1,
      display: "Accessibility",
      link: "#accessibility-details-container",
      visible: park.accessibility,
    },
    {
      sectionIndex: 2,
      display:
        !isLoadingAdvisories && !advisoryLoadError
          ? `Advisories (${advisories.length})`
          : "Advisories",
      link: "#park-advisory-details-container",
      visible: true,
    },
    {
      sectionIndex: 3,
      display: "Dates of operation",
      link: "#park-dates-container",
      visible: true,
    },
    {
      sectionIndex: 4,
      display: "Safety info",
      link: "#park-safety-info-container",
      visible: true,
    },
    {
      sectionIndex: 5,
      display: "Camping",
      link: "#park-camping-details-container",
      visible: hasCamping,
    },
    {
      sectionIndex: 6,
      display: "Facilities",
      link: "#park-facility-container",
      visible: activeFacilities.length > 0,
    },
    {
      sectionIndex: 7,
      display: "Activities",
      link: "#park-activity-container",
      visible: activeActivities.length > 0,
    },
    {
      sectionIndex: 8,
      display: "Location",
      link: "#park-maps-location-container",
      visible: true,
    },
    {
      sectionIndex: 9,
      display: capitalizeFirstLetter(`${park.type} and activity maps`),
      link: "#park-map-details-container",
      visible: park.maps,
    },
    {
      sectionIndex: 10,
      display: capitalizeFirstLetter(`Learn about this ${park.type}`),
      link: "#park-about-container",
      visible: true,
    },
    {
      sectionIndex: 11,
      display: "Reconciliation with Indigenous peoples",
      link: "#park-reconciliation-container",
      visible: park.reconciliationNotes,
    },
  ]

  const mapData = {
    latitude: park.latitude,
    longitude: park.longitude,
    mapZoom: park.mapZoom,
  }


  const parkName = renderHTML(park.parkNames.find(item=> item.parkNameType === PARK_NAME_TYPE.Escaped)?.parkName) || park.protectedAreaName

  const breadcrumbs = [
    <Link key="1" href="/">
      Home
    </Link>,
    <Link key="2" href="/explore">
      Find a Park
    </Link>,
    <div key="3" className="breadcrumb-text">
      {parkName}
    </div>,
  ]


  return (
    <div className="grey-background">
      <Helmet>
        <title content={ parkName || "BC Parks" }/>
      </Helmet>

      <Header mode="internal" content={menuContent} />
      <ScrollToTop />
      <CssBaseline />

      <div className="d-block d-sm-block d-xs-block d-md-block d-lg-none d-xl-none">
        <Grid item xs={12} sm={12}>
          <ParkPhotoGallery photos={photos} />
        </Grid>
      </div>
      <div className="container parks-container">
        <Container className="park-info-container" maxWidth={false}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <div className="p30t d-none d-xl-block d-lg-block d-md-none d-sm-none d-xs-none" />
              <Breadcrumbs
                separator="›"
                aria-label="breadcrumb"
                className="p20t"
              >
                {breadcrumbs}
              </Breadcrumbs>
            </Grid>
            <Grid item xs={12} sm={12}>
              <ParkHeader
                parkName={parkName || park.protectedAreaName}
                hasReservations={hasReservations}
                hasDayUsePass={hasDayUsePass}
                isLoadingAdvisories={isLoadingAdvisories}
                advisoryLoadError={advisoryLoadError}
                advisories={advisories}
              />
            </Grid>
          </Grid>
        </Container>
      </div>
      <div className="page-menu--mobile">
        <div className="d-block d-md-none">
          <PageMenu
            pageSections={menuItems}
            activeSection={activeSection}
            menuStyle="select"
          />
        </div>
      </div>
      <div className="container parks-container">
        <Container className="park-info-container" maxWidth={false}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <div className="d-none d-xl-block d-lg-block d-md-none d-sm-none d-xs-none">
                <ParkPhotoGallery photos={photos} />
              </div>
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={3}
              lg={3}
              className="page-menu--desktop d-none d-xl-block d-lg-block d-md-none d-sm-none d-xs-none"
            >
              <PageMenu
                pageSections={menuItems}
                activeSection={activeSection}
                menuStyle="nav"
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={9}
              lg={9}
              className={classes.parkContent}
            >
              {menuItems[0].visible && (
                <div ref={parkOverviewRef} className="full-width">
                  <ParkOverview data={park.description} type={park.type} />
                </div>
              )}
              {menuItems[1].visible && (
                <div ref={accessibilityRef} className="full-width">
                  <AccessibilityDetails />
                </div>
              )}
              {menuItems[2].visible && (
                <div ref={advisoryRef} className="full-width">
                  {isLoadingAdvisories && (
                    <div className="mb-5">
                      <Heading>{`Advisories`}</Heading>
                      <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  )}
                  {!isLoadingAdvisories && advisoryLoadError && (
                    <div className="mb-5">
                      <div className="alert alert-danger" role="alert">
                        An error occurred while loading current public
                        advisories.
                      </div>
                    </div>
                  )}
                  {!isLoadingAdvisories && !advisoryLoadError && (
                    <AdvisoryDetails advisories={advisories} />
                  )}
                </div>
              )}
              {menuItems[3].visible && (
                <div ref={parkDatesRef} className="full-width">
                  <ParkDates
                    data={{
                      parkOperation: park.parkOperation,
                      subAreas: park.parkOperationSubAreas,
                      advisories: advisories,
                    }}
                  />
                </div>
              )}
              {menuItems[4].visible && (
                <div ref={safetyRef} className="full-width">
                  <SafetyInfo park={park} />
                </div>
              )}
              {menuItems[5].visible && (
                <div ref={campingRef} className="full-width">
                  <CampingDetails
                    data={{
                      parkFacilities: activeFacilities,
                      reservations: park.reservations,
                      hasDayUsePass: hasDayUsePass,
                      hasReservations: hasReservations,
                    }}
                  />
                </div>
              )}
              {menuItems[6].visible && (
                <div ref={facilityRef} className="full-width">
                  <ParkFacility data={activeFacilities} />
                </div>
              )}
              {menuItems[7].visible && (
                <div ref={activityRef} className="full-width">
                  <ParkActivity data={activeActivities} />
                </div>
              )}
              {menuItems[8].visible && (
                <div ref={mapLocationRef} className="full-width">
                  <div id="park-maps-location-container" className="anchor-link">
                    <MapLocation data={mapData} />
                    {park.locationNotes && (
                      <Grid item xs={12} id="park-location-notes-container">
                        <Box mb={8}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: park.locationNotes,
                            }}
                          ></div>
                        </Box>
                      </Grid>
                    )}
                  </div>
                </div>
              )}
              {menuItems[9].visible && (
                <div ref={activityMapRef} className="full-width">
                  <ParkMapDetails data={park.maps} type={park.type} />
                </div>
              )}
              {menuItems[10].visible && (
                <div ref={aboutRef} className="full-width">
                  <About park={park} />
                </div>
              )}
              {menuItems[11].visible && (
                <div ref={reconciliationRef} className="full-width">
                  <Reconciliation data={park.reconciliationNotes} />
                </div>
              )}
              <br />
              <br />
              <br />
            </Grid>
          </Grid>
        </Container>
      </div>
      <Footer>{data.strapiWebsites.Footer}</Footer>
    </div>
  )
}

export const query = graphql`
  query ProtectedAreaDetails($orcs: Int) {
    strapiProtectedArea(orcs: { eq: $orcs }) {
      protectedAreaName
      description
      status
      orcs
      marineArea
      type
      typeCode
      hasDayUsePass
      locationNotes
      reconciliationNotes
      safetyInfo
      specialNotes
      parkContact
      natureAndCulture
      reservations
      maps
      latitude
      longitude
      mapZoom
      totalArea
      establishedDate
      parkActivities {
        isActive
        isActivityOpen
        description
        activityType {
          activityName
          activityCode
          isActive
          icon
          iconNA
          rank
        }
      }
      parkFacilities {
        isActive
        isFacilityOpen
        description
        facilityType {
          facilityName
          facilityCode
          isActive
          icon
          iconNA
          rank
        }
      }
      parkNames {
        parkNameType
        parkName
        id
      }
      parkOperation {
        openDate
        closeDate
        isActive
        hasReservations
        hasBackcountryReservations
        hasBackcountryPermits
        hasDayUsePass
        hasFirstComeFirstServed
        reservationUrl
        backcountryPermitUrl
        dayUsePassUrl
        hasParkGate
        offSeasonUse
        totalCapacity
        frontcountrySites
        reservableSites
        nonReservableSites
        vehicleSites
        vehicleSitesReservable
        doubleSites
        pullThroughSites
        rvSites
        rvSitesReservable
        electrifiedSites
        longStaySites
        walkInSites
        walkInSitesReservable
        groupSites
        groupSitesReservable
        backcountrySites
        wildernessSites
        boatAccessSites
        horseSites
        cabins
        huts
        yurts
        shelters
        boatLaunches
        cabins
        huts
        yurts
        shelters
        boatLaunches
        openNote
        serviceNote
        reservationsNote
        offSeasonNote
        generalNote
        adminNote
      }
      parkOperationSubAreas {
        parkSubArea
        orcsSiteNumber
        isActive
        isOpen
        hasReservations
        hasBackcountryReservations
        hasBackcountryPermits
        hasFirstComeFirstServed
        parkAccessUnitId
        isCleanAirSite
        totalCapacity
        frontcountrySites
        reservableSites
        nonReservableSites
        vehicleSites
        vehicleSitesReservable
        doubleSites
        pullThroughSites
        rvSites
        rvSitesReservable
        electrifiedSites
        longStaySites
        walkInSites
        walkInSitesReservable
        groupSites
        groupSitesReservable
        backcountrySites
        wildernessSites
        boatAccessSites
        horseSites
        cabins
        huts
        yurts
        shelters
        boatLaunches
        openNote
        serviceNote
        reservationNote
        offSeasonNote
        adminNote
        parkOperationSubAreaDates {
          isActive
          operatingYear
          openDate
          closeDate
          serviceStartDate
          serviceEndDate
          reservationStartDate
          reservationEndDate
          offSeasonStartDate
          offSeasonEndDate
        }
        parkSubAreaType {
          isActive
          subAreaType
          subAreaTypeCode
          iconUrl
        }
        facilityType {
          facilityName
          facilityNumber
          isActive
          icon
          rank
        }
      }
      
    }
    # Park photos are split into featured and non-featured in order to sort correctly,
    # with null values last.
    featuredPhotos: allStrapiParkPhoto(
      filter: {
        orcs: { eq: $orcs }
        isFeatured: { eq: true }
        isActive: { eq: true }
      }
      sort: {
        order: [ASC, DESC, DESC]
        fields: [sortOrder, dateTaken, strapiId]
      }
    ) {
      nodes {
        imageUrl
        caption
      }
    }
    regularPhotos: allStrapiParkPhoto(
      filter: {
        orcs: { eq: $orcs }
        isFeatured: { ne: true }
        isActive: { eq: true }
      }
      sort: {
        order: [ASC, DESC, DESC]
        fields: [sortOrder, dateTaken, strapiId]
      }
    ) {
      nodes {
        imageUrl
        caption
      }
    }
    strapiWebsites(Name: { eq: "BCParks.ca" }) {
      Footer
      Header
      Name
      Navigation
      id
      homepage {
        id
        Template
        Content {
          id
          strapi_component
        }
      }
    }
    allStrapiMenus(
      sort: { fields: order, order: ASC }
      filter: { show: { eq: true } }
    ) {
      nodes {
        strapiId
        title
        url
        order
        id
        imgUrl
        strapiChildren {
          id
          title
          url
          order
          parent
        }
        strapiParent {
          id
          title
        }
      }
    }
    site {
      siteMetadata {
        apiURL
      }
    }
  }
`
