import { onDocumentCreated } from "firebase-functions/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

// unique identifier for a coding session is sessionId (each document in the coding_history) happens when coding session is stopped
export const updateStats = onDocumentCreated("coding_history/{sessionId}", async(event) => {
    try {
        // session data is the data of the coding session added to the coding_history collection
        // event.data.ref is the reference to the document that triggered the function which is the coding session document in the coding_history collection
        const session = event.data?.data();
        if (!session) return;
        
        // Destructure the session data which is the data of the coding session that invoked the reactive function
        const { userId, editor, language, duration }  = session;
        const db = getFirestore();
        // stats collection is used to store the coding statistics of the user, unique identifier is userId
        const userStatsRef = db.collection("user_stats").doc(userId);
        
        // get the user's stats
        const userStats = await userStatsRef.get();
        const stats = userStats.data()

        // Update language minutes
        const currentLanguageMinutes = stats?.[language] || 0;
        const totalLanguageMinutes = currentLanguageMinutes + duration;

        // Update editor minutes
        const currentEditorMinutes = stats?.[editor] || 0;
        const totalEditorMinutes = currentEditorMinutes + duration;

        // Total Minutes
        const totalMinutes = (stats?.totalMinutes || 0) + duration;
        
        // We return this Promise so Firebase knows to wait or we use await like I did here
        await userStatsRef.set({
            [language]: totalLanguageMinutes,
            [editor]: totalEditorMinutes,
            totalMinutes,
            lastCoded: new Date(),
        }, { merge: true }); // merge: true is used to update the document instead of overwriting it to keep other languages and editors minutes

        logger.info("Created/Updated Stats for user", {
            sessionId: event.params.sessionId,
            userId: userId,
            editor: editor,
            language: language,
        });
        
        }
        catch (error: unknown) {
            logger.error("Failed to add/edit stats for user", error);
            throw error;
        }
    });