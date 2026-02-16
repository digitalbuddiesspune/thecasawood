import HeroSection from '../components/HeroSection'
import PopularCategories from '../components/PopularCategories'
import FeaturedCollection from '../components/FeaturedCollection'
import StyleInspiration from '../components/StyleInspiration'


import BestSeller from '../components/BestSeller'
import InteriorSolutions from '../components/InteriorSolutions'
import ModernLuxury from '../components/ModernLuxury'
import NewArrivalSofas from '../components/NewArrivalSofas'
import CraftsmanshipSection from '../components/CraftsmanshipSection'
import TestimonialSection from '../components/TestimonialSection'
import PoliciesSection from '../components/PoliciesSection'
import WhyChooseCasawood from '../components/WhyChooseCasawood'

const Home = () => {
    return (
        <>
            <HeroSection />
            <PopularCategories />
            <ModernLuxury />
            <NewArrivalSofas />
            <FeaturedCollection />
            <BestSeller />

            <StyleInspiration />
            <InteriorSolutions />
            <CraftsmanshipSection />
            <WhyChooseCasawood />
            <TestimonialSection />
            <PoliciesSection />


        </>
    )
}

export default Home
