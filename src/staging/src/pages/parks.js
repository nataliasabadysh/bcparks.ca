import React from "react"
import { Helmet } from "react-helmet"
import { graphql } from "gatsby"
import { Box, Grid, Container } from "@material-ui/core"

import Footer from "../components/footer"
import Header from "../components/header"

import "../styles/home.scss"

const ParksPage = ({ data }) => (
  <>
    <Helmet>
      <title>BC Parks</title>
    </Helmet>
    <Header />
    <Container>
      <br />
      <h1>Parks</h1>
      <Box m={4} p={3}>
        <Grid container spacing={0}>
          {data.allStrapiProtectedArea.edges.map(document => (
            <Grid item xs={12} key={document.node.id}>
              <p>
                <a
                  href={`/${(document.node.slug
                    ? document.node.slug
                    : document.node.protectedAreaName
                      .toLowerCase()
                      .replace(/ /g, "-"))
                    .replace(/\/$|$/, `/`)
                    }`}
                >
                  {`${document.node.protectedAreaName}`}
                </a>
              </p>
            </Grid>
          ))}
          <Grid item xs={12}></Grid>
        </Grid>
      </Box>
    </Container>
    <Footer />
  </>
)

export default ParksPage

export const query = graphql`
  {
    allStrapiProtectedArea(filter: {isDisplayed: {eq: true}}, sort: { fields: protectedAreaName }) {
      edges {
        node {
          id
          orcs
          protectedAreaName
          typeCode
          url
          slug
        }
      }
    }
  }
`
