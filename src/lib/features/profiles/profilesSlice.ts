import { createSlice } from '@reduxjs/toolkit';
import { Profile } from '@/lib/Classes/Profile/Profile';
import { Post } from '@/lib/Classes/Posts/PostsClasses';
import { PostComment } from '@/lib/Classes/Posts/Comments';
import { IProfile } from '@/lib/db';

interface profilesState {
  profiles: IProfile[];
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
        if (profile.posts) {
          profile.posts.push(postId.ToInterface());
        } else {
          profile.posts = [];
          profile.posts.push(postId);
        }
      } else {
        console.error("USER DATA NOT FOUND")
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

const VipDefaultProfiles = (): IProfile[] => {

  const Pazuzu : IProfile = {
    id : 1,
    username : 'Pazuzu',
    avatarUrl : '',
    posts : [],
    bio : 'Gattino grigetto con la barba bianca e un solo occhio sano.',
    bannerUrl : ''
  }

  const Lilith : IProfile = {
    id : 2,
    username : 'Lilith',
    avatarUrl : '',
    posts : [],
    bio : '',
    bannerUrl : ''
  }

  const Moka : IProfile = {
    id : 3,
    username : 'Moka',
    avatarUrl : '',
    posts : [],
    bio : '',
    bannerUrl : ''
  }

  const Mandarino : IProfile = {
    id : 4,
    username : 'Mandarino',
    avatarUrl : '',
    posts : [],
    bio : '',
    bannerUrl : ''
  }



  return [Pazuzu, Lilith, Moka, Mandarino]
}

export const { addProfile, removeProfile, addPostToProfile, initializeProfiles, setProfiles, addProfiles } = profilesSlice.actions;
export default profilesSlice.reducer;
