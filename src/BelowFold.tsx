import ThirukkuralSection from "./sections/ThirukkuralSection"
import AboutSection from "./sections/AboutSection"
import Mainvideo from "./sections/Mainvideo"
import VisionMissionSection from "./sections/VisionMissionSection"
import FrameworkSection from "./sections/FrameworkSection"
import BrandsSection from "./sections/BrandsSection"
import SpecializationsSection from "./sections/SpecializationsSection"
import WorkshopsSection from "./sections/WorkshopsSection"
import ActivitiesSection from "./sections/ActivitiesSection"
import AwardsSection from "./sections/AwardsSection"
import LeadershipSection from "./sections/LeadershipSection"
import MainEvent from "./sections/MainEvent"
import EventsSection from "./sections/EventsSection"
import RoadmapSection from "./sections/RoadmapSection"
import ContactFooterSection from "./sections/ContactFooterSection"

/** Every below-the-fold section, in document order, as a single code-split chunk. */
export function BelowFold() {
  return (
    <>
      <ThirukkuralSection />
      <AboutSection />
      <Mainvideo />
      <VisionMissionSection />
      <FrameworkSection />
      <BrandsSection />
      <SpecializationsSection />
      <WorkshopsSection />
      <ActivitiesSection />
      <AwardsSection />
      <LeadershipSection />
      <MainEvent />
      <EventsSection />
      <RoadmapSection />
      <ContactFooterSection />
    </>
  )
}

export default BelowFold
