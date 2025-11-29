import { FaceKittenDB, IProfile } from "@/lib/db";
import { saveLocalUserProfile } from "@/lib/utils";
import { UserData } from "@/lib/interfaces/CommonInterfaces";


export const initializeHomePage = async (username: string) => {

    const db = new FaceKittenDB();

    const storeUserProfile: IProfile | undefined = await db.userProfile.get(0)

    let userProfile;
    if (!storeUserProfile) {
        userProfile = await generateUserProfileInterface(username);
        saveLocalUserProfile(userProfile, db);
    } else {
        userProfile = storeUserProfile
        console.log("RELOAD USERPROFILE",storeUserProfile )
    }

    const userData: UserData = {
        username: userProfile.username,
        avatarUrl: userProfile.avatarUrl,
        bio: userProfile.bio,
        bannerUrl: userProfile.bannerUrl,
        posts: [],
        following: [],
    };
    
    console.log("DISPACTH SET USER", userData)

}

export const generateUserProfileInterface = async (username: string): Promise<IProfile> => {
    const RandomPropic = await fetch("/api/get/randomProfilePicture", {
        credentials: "include",
    })
        .then(r => {
            if (!r.ok) throw new Error("Unauthorized");
            return r.json();
        })
        .then(data => data.url);

    const BannerUrl = await fetch("/api/get/randomCoverPhoto", {
        credentials: "include",
    })
        .then(r => {
            if (!r.ok) throw new Error("Unauthorized");
            return r.json();
        })
        .then(data => data.url);

    const userProfile: IProfile = {
        id: 0,
        username: username,
        avatarUrl: RandomPropic,
        bio: `Il profilo di ${username} è stato creato il ${new Date().toLocaleDateString()}. Benvenuto su FaceKitten!`,
        bannerUrl: BannerUrl,
        posts:[],
        followingIds:[],
        comments:[]
    };
    return userProfile;
}

