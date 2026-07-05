import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/hero";
import { PillarsAndGuarantee } from "@/components/PillarsAndGuarantee";
import { FlockEstimator } from "@/components/FlockEstimator";
import { ServicesAndRates } from "@/components/ServicesAndRates";
import { ServiceAreaChecker } from "@/components/ServiceAreaChecker";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { BookingForm } from "@/components/BookingForm";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"LocalBusiness\",\"name\":\"sheepsheeran\",\"description\":\"we are a travelling sheep shearer, you get high quality output, estimation per flock, we come to you, we clean up after ourself, highly professional and amazing quality\",\"address\":{\"@type\":\"PostalAddress\",\"addressLocality\":\"ireland, cork\"},\"url\":\"https://sheepsheeran-d36230.duckbyte.co\"}" }} />
      <Navbar />
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <Hero />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <PillarsAndGuarantee />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <FlockEstimator />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <ServicesAndRates />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <ServiceAreaChecker />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <PortfolioGallery />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <BookingForm />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <AdminDashboard />
      </Suspense>
      <Footer />
    </main>
  );
}
