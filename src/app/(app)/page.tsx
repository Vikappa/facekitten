import PostForm from "@/app/components/organisms/PostForm/PostForm";
import PostList from "@/app/components/organisms/PostList/PostList";
import SideBars from "@/app/components/organisms/SideBars/SideBars";
import MobileMiniNavBar from "../components/organisms/NavbarParts/MobileMiniNavBar";

export default function Home(){
    return (
        <SideBars>
            <MobileMiniNavBar/>
            <PostForm/>
            <PostList/>
        </SideBars>
    )
}
