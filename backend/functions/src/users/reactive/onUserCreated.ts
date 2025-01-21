import { onDocumentCreated } from "firebase-functions/firestore";
import { logger } from "firebase-functions";

// event is the event that triggered the function document here
export const onUserCreated = onDocumentCreated("users/{userId}", (event) => {
    try {
        // doing event.data.data gives us the data of the document that triggered the function
        const userData = event.data?.data();

        logger.info("New user created", {
            userId: event.params.userId,
            email: userData?.email,
            name: userData?.name
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