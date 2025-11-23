"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/lib/store";
import { FaceKittenDB, IProfile } from "@/lib/db";
import { setUser } from "@/lib/features/userData/userDataSlice";
import { UserData } from "@/lib/interfaces/CommonInterfaces";
import { addProfiles } from "@/lib/features/profiles/profilesSlice";
import { initializeChats } from "@/lib/features/chats/chatSlice";

export function UserBootstrap() {
  const dispatch = useDispatch<AppDispatch>();
  const db = new FaceKittenDB();

  useEffect(() => {
    const loadUser = async () => {
      const profile: IProfile | undefined = await db.userProfile.get(0);
      if (!profile) return;

      const userData: UserData = {
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        bannerUrl: profile.bannerUrl,
        posts: [],
        following: [],
      };

      dispatch(setUser(userData));
    };

    const loadProfiles = async () => {
      const profilesData = await db.profiles.toArray();

      dispatch(addProfiles(profilesData));
    };

    dispatch(initializeChats());
    loadProfiles();
    loadUser();
  }, [dispatch]);

  return null;
}
