import PostForm from "@/app/components/organisms/PostForm/PostForm";
import PostList from "@/app/components/organisms/PostList/PostList";
import SideBars from "@/app/components/organisms/SideBars/SideBars";

export default function Home(){
    return (
        <SideBars>
            <PostForm/>
            <PostList/>
        </SideBars>
    )
}
