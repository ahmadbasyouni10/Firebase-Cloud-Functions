/*  Tell Firebase which functions to deploy and make available to your application. */

import { addPaymentMethod } from './users/restful/addPaymentMethod';
import { onUserCreated } from './users/reactive/onUserCreated';

export {
    addPaymentMethod,
    onUserCreated
};