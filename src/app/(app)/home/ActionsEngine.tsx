"use client";

import { FaceKittenDB, IPost } from "@/lib/db";
import { useRandomProfileId } from "@/lib/dbHooks";
import { ReactNode, useEffect, useRef } from "react";

export function Engine({ children }: { children: ReactNode }) {
    const randomProfileId = useRandomProfileId();
    const randomProfileIdRef = useRef<string | undefined>();

    useEffect(() => {
        randomProfileIdRef.current = randomProfileId ?? undefined;
    }, [randomProfileId]);

    useEffect(() => {
        console.log("RandomActionRunner attivo… preparati.");

        const interval = setInterval(() => {
            const id = randomProfileIdRef.current;

            if (!id) {
                console.log("Nessun profilo random ancora, salto questo giro");
                return;
            }

            requestRandomPost(id);
        }, 90_000); // 1 secondo per debug

        return () => clearInterval(interval);
    }, []);

    return <>{children}</>;
}

async function requestRandomPost(authorId: string) {
    try {
        const author = await new FaceKittenDB().profiles.get(authorId);

        if (!author) {
            console.error("Autore non trovato in Dexie per id:", authorId);
            return;
        }

        console.log("Chiamo /api/get/createRandomPost per author:", authorId);

        const RandomPostResponse = await fetch("/api/get/createRandomPost", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ author }),
        });

        console.log("RESPONSE createPost:", RandomPostResponse);

        if (!RandomPostResponse.ok) {
            console.error("Errore dalla API:", await RandomPostResponse.text());
            return;
        }

        const post : IPost = await RandomPostResponse.json();
        console.log("Post generato:", post);
        post.id = crypto.randomUUID()

        await new FaceKittenDB().posts.add(post);

    } catch (err) {
        console.error("Errore in requestRandomPost:", err);
    }
}