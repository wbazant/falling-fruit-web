import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'

import { EntryTabs, Tab, TabList, TabPanel, TabPanels } from '../ui/EntryTabs'
import LoadingIndicator, { LoadingOverlay } from '../ui/LoadingIndicator'
import Carousel from './Carousel'
import Lightbox from './Lightbox'

// Wraps the entire page and gives it a top margin if on mobile
export const Page = styled.div`
  @media ${({ theme }) => theme.device.mobile} {
    ${({ isInDrawer }) =>
      isInDrawer ? 'padding-bottom: inherit' : 'padding-top: 87px;'}
  }

  width: 100%;
`

export const TextContent = styled.article`
  padding: 20px 23px;

  @media ${({ theme }) => theme.device.desktop} {
    padding: 12px;
  }
  h2 {
    margin-top: 0;
    font-size: 1rem;
  }

  box-sizing: border-box;

  ul {
    margin: 0 0 12px 0;
  }
`

const Entry = ({
  isInDrawer,
  locationData,
  reviews,
  isLoading,
  entryOverview,
  entryReviews,
  showTabs,
  isLightboxOpen,
  setIsLightboxOpen,
  lightboxIndex,
  setLightboxIndex,
  isFullScreen,
}) => {
  const [tabIdx, setTabIdx] = useState(0)

  useEffect(() => {
    if (!isFullScreen) {
      setTabIdx(0)
    }
  }, [isFullScreen])

  let content

  if (!locationData || !reviews) {
    content = <LoadingIndicator cover vertical />
  } else {
    const reviewsWithPhotos = reviews.filter(
      (review) => review.photos.length > 0,
    )
    const lightboxIndices = reviewsWithPhotos
      .map((review, ri) => review.photos.map((_, pi) => [ri, pi]))
      .flat()
    const allReviewPhotos = reviewsWithPhotos
      .map((review) => review.photos)
      .flat()
    const onClickCarousel = (idx) => {
      setLightboxIndex(lightboxIndices[idx])
      setIsLightboxOpen(true)
    }

    content = (
      <>
        {isLightboxOpen && reviews && (
          <Lightbox
            onDismiss={() => setIsLightboxOpen(false)}
            reviews={reviews ?? []}
            index={lightboxIndex}
            onIndexChange={setLightboxIndex}
          />
        )}
        {isInDrawer ? (
          <EntryTabs onChange={setTabIdx} index={tabIdx}>
            {showTabs && (
              <TabList>
                {/* TODO: Use Routing */}
                <Tab>Overview</Tab>
                <Tab>Reviews ({reviews.length})</Tab>
              </TabList>
            )}
            <TabPanels>
              <TabPanel>{entryOverview}</TabPanel>
              <TabPanel>{entryReviews}</TabPanel>
            </TabPanels>
          </EntryTabs>
        ) : (
          <>
            {allReviewPhotos.length > 0 && (
              <Carousel
                onClickItem={onClickCarousel}
                showIndicators={allReviewPhotos.length > 1}
              >
                {allReviewPhotos.map((photo) => (
                  <img key={photo.id} src={photo.medium} alt="entry" />
                ))}
              </Carousel>
            )}
            {entryOverview}
            {entryReviews}
          </>
        )}
        {isLoading && <LoadingOverlay />}
      </>
    )
  }

  return <Page isInDrawer={isInDrawer}>{content}</Page>
}

export default Entry
