import { onRequest } from "firebase-functions/https";
import { getFirestore } from "firebase-admin/firestore";

export const trackCodingSession = onRequest(async (req, res) => {
    try {
        const { userId, editor, language} = req.body;

        await getFirestore()
            .collection("active_sessions")
            .doc(userId)
            .set({
                editor,
                language, 
                lastActive: new Date(),
                isActive: true
            }, { merge: true });
        
            res.json({
                success: true,
                message: "Coding session updated"
            });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to track coding session",
            error: error.message
        });

    }
})