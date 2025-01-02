import { onRequest } from "firebase-functions/https";
import { getFirestore } from "firebase-admin/firestore";

export const addPaymentMethod = onRequest(async (req, res) => {
    try {
        const { card_number, card_holder } = req.body;

        const writeResult = await getFirestore()
            .collection("payments")
            .add({
                cardNumber: card_number,
                cardHolder: card_holder,
                timestamp: new Date()
            });
        
            res.json({
                success: true, 
                paymentId: writeResult.id,
                message: "Payment method added successfully"
            });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to add payment method",
            error: error.message
        });

    }
})