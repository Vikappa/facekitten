import PostForm from "./components/organisms/PostForm/PostForm";
import PostList from "./components/organisms/PostList/PostList";
import SideBars from "./components/organisms/SideBars/SideBars";

export default function Home(){
    return (
        <SideBars>
            <PostForm/>
            <PostList/>
        </SideBars>
    )
}