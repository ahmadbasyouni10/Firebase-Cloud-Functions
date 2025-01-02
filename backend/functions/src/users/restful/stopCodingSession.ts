import { onRequest } from "firebase-functions/https";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

export const stopCodingSession = onRequest(async (req, res) => {
    try {
        const { userId } = req.body;
        // get firestore instance
        const db = getFirestore();

        // get the user's active session
        const sessionRef = db.collection("active_sessions").doc(userId);
        const session = await sessionRef.get();
        const sessionData = session.data();

        if (sessionData) {
            // Calculate the duration of the session
            const lastActive = sessionData.lastActive.toDate();
            const now = new Date();
            const duration = Math.floor((now.getTime() - lastActive.getTime()) / 6000);

            await db.collection("coding_history").add({
                userId,
                editor: sessionData.editor,
                language: sessionData.language,
                duration
            })
            
            await sessionRef.update({
                isActive: false
            })
        }

        res.json({
            success: true,
            message: "Coding session stopped"
        });

        
    } catch (error: any) {
        logger.error("Failed to stop coding session", error);
        res.status(500).json({
            success: false,
            message: "Failed to stop coding session",
            error: error.message
        });

    }
})