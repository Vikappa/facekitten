import { FaceKittenDB, IProfile } from "@/lib/db";
import { doPromptJson } from "@/lib/services/Gemini API/GeminiAPInterrogation";
import { imageUrlToBase64 } from "@/lib/utils";

export async function GenerateProfile(): Promise<IProfile> {

    const db = new FaceKittenDB();
    const profile: IProfile = {
        id: crypto.randomUUID(),
        username: "",
        avatarUrl: "",
        bio: "",
        bannerUrl: "",
        postIds: [],
        commentsIds: []
    };

    const AvatarUrl = await fetch("/api/get/randomProfilePicture", {
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

    profile.avatarUrl = AvatarUrl;
    profile.username = await createRandomUserName(db);
    profile.bannerUrl = BannerUrl;

    const ProfileVisionDTO: DoMyBioRequestDTO = {
        avatarImageBase64: await imageUrlToBase64(profile.avatarUrl) as string
    }

    const BioResponseSchema = {
        type: "object",
        properties: {
            bio: {
                type: "string",
                description: "A generated bio text for the profile"
            }
        },
        required: ["bio"]
    };

    // const response: DoMyBioResponseDTO = await InterrogateGoogleVisionForProfileBIO(
    //     ProfileVisionDTO,
    //     BioResponseSchema,
    //     `Su un social network per soli gatti, crea una breve biografia per questo profilo basata sull'immagine fornita. Ti chiami ${profile.username}. La biografia dovrebbe riflettere la personalità e l'umore del gatto nell'immagine, essere accattivante e adatta a un pubblico di amanti dei gatti. Si ironico e memico.`
    // )

    // profile.bio = response.bio;
    return profile;
}

// export async function InterrogateGoogleVisionForProfileBIO(doMyBioRequestDTO: DoMyBioRequestDTO, BioResponseSchema: object, prompt: string): Promise<DoMyBioResponseDTO> {

//     const response = await doPromptJson<typeof BioResponseSchema>(
//         doMyBioRequestDTO.avatarImageBase64,
//         prompt,
//         BioResponseSchema
//     );

//     const parsedResponse: DoMyBioResponseDTO = JSON.parse(response.text || "{}");

//     return parsedResponse;
// }

export interface DoMyBioRequestDTO {
    avatarImageBase64: string;
}

export interface DoMyBioResponseDTO {
    bio: string;
}

const createRandomUserName = async (db: FaceKittenDB): Promise<string> => {
    // Get all existing usernames from the database
    const existingProfiles = await db.profiles.toArray();
    const generatedNames = new Set(existingProfiles.map((profile: IProfile) => profile.username));

    const names = [
        "Micio", "Luna", "Felix", "Tigro", "Leo", "Nina", "Vladdalo", "Zoe", "Salem", "Mila",
        "Oliver", "Simba", "Miciomicio", "Bella", "Charlie", "Sophie", "Jasper", "Maya", "Oreo", "Misty",
        "Loki", "Chloe", "Ginger", "Lily", "Shadow", "Bernardo", "Muffin", "Smokey", "Max", "Sasha", "Pepper",
        "Molly", "Tom", "Daisy", "Toby", "Fluffy", "Thor", "Fiona", "Milo", "Luna", "Gizmo", "Lola",
        "Socks", "Rusty", "Juno", "Gatto", "Dante", "Leomawrdo", "Tiger", "Mirtilla", "Margherita", "Bianca",
        "Garfield",
        "Mirtilla",
        "Mirtillina",
        "Nyan",
        "Bongo",
        "Grumpy",
        "BigFloppa",
        "SmolFloppa",
        "PallaDiPelo",
        "Ciccio",
        "MiaoMiao",
        "Nyah",
        "Purrito",
        "Fuffi",
        "Cotechinho",
        "Zampalà",
        "Lord Micio",
        "Sir Purr",
        "Meowzilla",
        "Purrgatorio",
        "Pixel",
        "Bug",
        "Lag",
        "404",
        "Stacktrace",
        "Segfault",
        "Pancake",
        "Toast",
        "Biscotto",
        "Frittella",
        "Tempura",
        "Ramen",
        "Wasabi",
        "Udon",
        "Nigiri",
        "Maki",
        "Gnocchino",
        "Tagliatello",
        "Carbonello",
        "Spritz",
        "Negroni",
        "Estathé",
        "Redbull",
        "CaffèLungo",
        "Espresso",
        "Deca",
        "PixelMicio",
        "Glitch",
        "Laggo",
        "Buffer",
        "Cookie",
        "Runtime",
        "Kernel",
        "Socket",
        "Firewall",
        "Proxy",
        "VPN",
        "Shader",
        "LoFi",
        "Vibe",
        "Cringe",
        "Based",
        "Sigma",
        "Chad",
        "Gremlin",
        "Gremlinino",
        "Sgrunf",
        "Prrrr",
        "Brrrt",
        "Mew",
        "Meeew",
        "Yowl",
        "Skrra",
        "PssPss",
        "BauFinto",
        "GattoDoggo",
        "Baffo",
        "Baffuzzo",
        "OcchioLesto",
        "Nerino",
        "Puntino",
        "Pixelino",
        "Nebbia",
        "Fumo",
        "Braciola",
        "Polpetta",
        "Kebab",
        "Gyro",
        "Burrito",
        "Nacho",
        "Taco",
        "Queso",
        "Sushi",
        "Tempest",
        "Chaos",
        "Void",
        "Oblio",
        "DoomMiao",
        "Pazuzu",
        "Lilith",
        "Mandarino",
        "Moka",
        "Boss",
        "Capo",
        "Zar",
        "Imperatore",
        "Duca",
        "Barone",
        "Contino",
        "Sgorbio",
        "Goblin",
        "Maledetto",
        "Sfinge",
        "Ombra",
        "PixelCat",
        "Debug",
        "Compiler",
        "Lambda",
        "Promise",
        "Async",
        "Await",
        "Git",
        "Commit",
        "Merge",
        "Rebase"
    ];

    const surnames = [
        "Rossi", "Neri", "Bianchi", "Grigi", "Tigrato", "Maculato", "Silvestri", "DiCaprio", "Pallido", "Striato",
        "Criminale di Guerra", "Balzano", "Veloce", "Zampadoro", "CodaLunga", "Zampini", "Sonnacchioso", "Furtivo", "Silenzioso", "McCodino", "Notturno",
        "Sbuffante", "Miaomiao", "Agile", "Sornione", "Lucente", "Panciuto", "Vagabondo", "Guizzante", "Pennellato", "Artiglio",
        "Sospetto", "Nebuloso", "Vibrisse", "Calzato", "Sfuggente", "Ramingo", "Screziato", "Zampone", "Stravagante", "Occhioni",
        "Fuggente", "Guardingo", "McFurr", "Scattante", "Misterioso", "Serafico", "Saltatore", "Indomito", "Vispo", "Cauto",
        "del Quartiere",
        "di Casa",
        "dell’Ultimo Piano",
        "il Distruttore di Divani",
        "RompiZanzariera",
        "Spaccatende",
        "RaschiaMuri",
        "MangiaCavi",
        "AcchiappaCursori",
        "SpaccaVasi",
        "della Lettiera",
        "di Sottoscala",
        "di Soprammobile",
        "dell’Armadio",
        "della Lavatrice",
        "Scivoloso",
        "delle Tenebre",
        "del Garage",
        "del Condominio",
        "di Quartiere",
        "del Vicolo Stretto",
        "del Cassonetto",
        "del Cuscino",
        "RompiSilenzio",
        "SpaccaSonno",
        "SvegliaAlleTre",
        "AllAlbaDelleCrocchette",
        "MordeCaviglie",
        "SpaventaPostini",
        "di Schroedinger",
        "del Multiverso",
        "BugGrafico",
        "FrameDrop",
        "FPSBasso",
        "InputLag",
        "PacketLoss",
        "Timeout",
        "Overflow",
        "NullReference",
        "NonTrovato",
        "404NotFound",
        "SegnalatoSuInstagram",
        "InfluencerFelino",
        "ContentCreator",
        "StreamerNotturno",
        "di TikTok",
        "Sgattaiolante",
        "CodaSpettro",
        "ZampaFantasma",
        "OcchioRosso",
        "PeloNebbia",
        "WhiskerStorm",
        "PurrMachine",
        "di Croccantilandia",
        "GuardianoDelFrigo",
        "Spegniluce",
        "della Tastiera",
        "del Mousepad",
        "della Scrivania",
        "della Ringhiera",
        "del Balcone",
        "dell’Anta Socchiusa",
        "Signore del Corridoio",
        "Imperatore del Divano",
        "Terrorista dei Calzini",
        "Distruttore di Rotoli",
        "FrantumaCrocchette",
        "SpazzaCiotole",
        "MangiaAvanzi",
        "SniffaScatole",
        "ScavalcaMuri",
        "Parkourista",
        "della Zona Industriale",
        "del Parcheggio",
        "del Supermercato",
        "del Cortile",
        "di Campagna",
        "di Periferia",
        "del Centro Storico",
        "di Nessuno",
        "Randagio Certificato",
        "NonRichiamabile",
        "Inafferrabile",
        "del Mirino Laser",
        "Cacciatore di Puntini",
        "Predatore di Fili",
        "Annusatore di Scarpe",
        "Signore dei Cartoni",
        "Custode degli Scontrini",
        "della Scatola Piccola",
        "TroppoGrandePerLaScatola",
        "ForteOdore",
        "DormiglioneCronico",
        "SnackDipendente",
        "ProfessionistaDelSonno",
        "EspertoDiNulla",
        "StudiDiDivano",
        "Laurea in Fusa Applicate"
    ];


    let randomName: string;
    let randomSurname: string;
    let fullName: string;

    do {
        randomName = names[Math.floor(Math.random() * names.length)];
        randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
        fullName = `${randomName} ${randomSurname}`;
    } while (generatedNames.has(fullName));

    generatedNames.add(fullName);

    return fullName;
}

