"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/lib/store";
import { FaceKittenDB, IProfile } from "@/lib/db";
import { setUser } from "@/lib/features/userData/userDataSlice";
import { UserData } from "@/lib/interfaces/CommonInterfaces";

export function UserBootstrap() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const loadUser = async () => {
      const db = new FaceKittenDB();
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

    loadUser();
  }, [dispatch]);

  return null;
}
