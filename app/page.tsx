import Bodyintro from "./components/bodyintro";
import Navbar from "./components/navbar";

export default function Home() {
  return (
    <div className="text-4xl">
      <Navbar />
      <Bodyintro />
    </div>
  );
}
