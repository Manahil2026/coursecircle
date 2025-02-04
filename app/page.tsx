import Landing_page from "./components/landing_page";
import Student_dashboard from "./components/student_dashboard";

export default function Home() {
  return (
    <div>
      <Landing_page />
      {/* Uncomment the dashboard and comment out the landing page to view */}
      {/* <Student_dashboard /> */}
    </div>
  );
}
