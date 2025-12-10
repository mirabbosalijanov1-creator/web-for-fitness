import { Hero } from \"@/components/landing/Hero\";
import { Process } from \"@/components/landing/Process\";
import { FeatureGrid } from \"@/components/landing/FeatureGrid\";
import { CallToAction } from \"@/components/landing/CallToAction\";

export default function Home() {
  return (
    <>
      <Hero />
      <Process />
      <FeatureGrid />
      <CallToAction />
    </>
  );
}
