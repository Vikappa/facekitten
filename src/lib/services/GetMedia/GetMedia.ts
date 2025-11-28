export async function GetProfilePicture(): Promise<string> {
    const response: ProfilePictureResponseModel = await fetch('/api/get/randomProfilePicture')

        .then(res => res.json())
        .then(data => data as ProfilePictureResponseModel);
    if (!response.url) {
        throw new Error("Failed to fetch profile picture");
    }
    return response.url;
}

interface ProfilePictureResponseModel {
    url?: string;
}