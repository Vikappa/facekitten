import { CrossList } from "../../components/organisms/CrossList";
import { LeftSideBar } from "../../components/organisms/LeftSidebar";
import { NavBar } from "../../components/organisms/Navbar/Navbar";
import { RightSidebar } from "../../components/organisms/RightSideBar";

export default function HomePage() {

  return (
    <div className="flex">
      <LeftSideBar />
      <CrossList />
      <RightSidebar />
    </div>
  );
}
