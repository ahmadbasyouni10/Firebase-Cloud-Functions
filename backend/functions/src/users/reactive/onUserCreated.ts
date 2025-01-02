import { onDocumentCreated } from "firebase-functions/firestore";
import { logger } from "firebase-functions";

export const onUserCreated = onDocumentCreated("users/{userId}", (event) => {
    try {
        const userData = event.data?.data();

        logger.info("New user created", {
            userId: event.params.userId,
            email: userData?.email,
        });
        
        // We return this Promise so Firebase knows to wait 
        return event.data?.ref.set({
            welcomeMessage: `Welcome, ${userData?.name}!`,
            createdAt: new Date(),
        }, { merge: true });
        
        }
        catch (error: unknown) {
            logger.error("Failed to create user", error);
            throw error;
        }
    });