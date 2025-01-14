import React from "react"
import { graphql } from "gatsby"

import Footer from "../components/footer"
import Header from "../components/header"
import HTMLArea from "../components/HTMLArea"
import Seo from "../components/seo"

import "../styles/betaLanding.scss"

const IntroPage = ({ data }) => {
  const pageContent = data?.strapiPages?.Content || []
  const menuContent = data?.allStrapiMenus?.nodes || []

  const htmlContent = pageContent.find(
    item => item.strapi_component === "parks.html-area"
  )
  const seoContent = pageContent.find(
    item => item.strapi_component === "parks.seo"
  )

  return (
    <>
      {seoContent && (
        <Seo
          title={seoContent.metaTitle}
          description={seoContent.description}
          keywords={seoContent.metaKeywords}
        />
      )}

      <div className="max-width-override">
        <Header mode="internal" content={menuContent} />
      </div>

      {htmlContent && (
        <div className="intro-page">
          <HTMLArea isVisible={true}>{htmlContent.HTML}</HTMLArea>
        </div>
      )}

      <div className="max-width-override">
        <Footer />
      </div>
    </>
  )
}

export default IntroPage

export const query = graphql`
  {
    strapiPages(Slug: { eq: "/beta-landing" }) {
      id
      Slug
      Content
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
  }
`
