import { FaceKittenDB, IProfile } from "@/lib/db";
import { saveLocalUserProfile } from "@/lib/utils";


export const initializeHomePage = async (username: string) => {

    const db = new FaceKittenDB();

    const storeUserProfile: IProfile | undefined = await db.profiles.get(0)

    let userProfile;
    if (!storeUserProfile) {
        userProfile = await generateUserProfileInterface(username, db);
        saveLocalUserProfile(userProfile, db);
    } else {
        userProfile = storeUserProfile
        console.log("RELOAD USERPROFILE", storeUserProfile)
    }

    const userData: IProfile = {
        username: userProfile.username,
        avatarUrl: userProfile.avatarUrl,
        bio: userProfile.bio,
        bannerUrl: userProfile.bannerUrl,
        postIds: [],
        commentsIds: [],
        id: "0"
    };

    db.profiles.put(userProfile)
}

export const generateUserProfileInterface = async (username: string, db:FaceKittenDB): Promise<IProfile> => {
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

    const vipProfiles = await fetch("/api/getVIPs", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            {
                currentProfiles: []
            },
        ),
    });

    const data = await vipProfiles.json();


    db.profiles.bulkAdd(data)

    const userProfile: IProfile = {
        id: "0",
        username: username,
        avatarUrl: RandomPropic,
        bio: `Il profilo di ${username} è stato creato il ${new Date().toLocaleDateString()}. Benvenuto su FaceKitten!`,
        bannerUrl: BannerUrl,
        followingIds: [],
        postIds: [],
        commentsIds: []
    };
    return userProfile;
}

