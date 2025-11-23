import { createSlice } from '@reduxjs/toolkit';
import { Profile } from '@/lib/Classes/Profile/Profile';
import { Post } from '@/lib/Classes/Posts/PostsClasses';
import { PostComment } from '@/lib/Classes/Posts/Comments';

interface profilesState {
  profiles: Profile[];
}

const initialState: profilesState = {
  profiles: [],
};

export const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    addProfile(state, action) {
      state.profiles.push(action.payload);
    },
    addProfiles(state, action) {
      state.profiles = state.profiles.concat(action.payload);
    },
    removeProfile(state, action) {
      state.profiles = state.profiles.filter(
        (profile) => profile.id !== action.payload
      );
    },
    addPostToProfile(state, action) {
      const { profileId, postId } = action.payload;
      const profile = state.profiles.find((p) => p.id === profileId);
      if (profile) {
        profile.posts.push(postId);
      }
    },
    addCommentToPost(state, action) {
      const { profileId, commentId, postId } = action.payload;
      const profile = state.profiles.find((p: Profile) => p.id === profileId);
      const post = profile?.posts.find((p: Post) => p.id === postId);
      if (post) {
        post.comments.push(commentId);
      }
    },
    addReplyToComment(state, action) {
      const { profileId, postId, commentId, replyId } = action.payload;
      const profile = state.profiles.find((p) => p.id === profileId);
      const post = profile?.posts.find((p: Post) => p.id === postId);
      const comment = post?.comments.find((c: PostComment) => c.id === commentId);
      if (comment) {
        comment.replies.push(replyId);
      }
    },
    initializeProfiles(state) {
      state.profiles = VipDefaultProfiles();
    },
    setProfiles(state, action) {
      state.profiles = action.payload;
    }
  },
});

const VipDefaultProfiles = (): Profile[] => {

  const Pazuzu: Profile = {
    id: 0,
    username: 'Pazuzu',
    avatarUrl: '',
    posts: [],
    bio: 'Gattino grigetto con la barba bianca e un solo occhio sano.',
    bannerUrl: '',
    following: []
  };
  const Lilith: Profile = {
    id: 1,
    username: 'Lilith',
    avatarUrl: '',
    posts: [],
    bio: '',
    bannerUrl: '',
    following: []
  };
  const Moka: Profile = {
    id: 2,
    username: 'Moka',
    avatarUrl: '',
    posts: [],
    bio: '',
    bannerUrl: '',
    following: []
  };
  const Mandarino: Profile = {
    id: 3,
    username: 'Mandarino',
    avatarUrl: '',
    posts: [],
    bio: '',
    bannerUrl: '',
    following: []
  };


  return [Pazuzu, Lilith, Moka, Mandarino]
}

export const { addProfile, removeProfile, addPostToProfile, addCommentToPost, addReplyToComment, initializeProfiles, setProfiles, addProfiles } = profilesSlice.actions;
export default profilesSlice.reducer;
