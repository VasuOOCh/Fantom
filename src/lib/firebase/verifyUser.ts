import { adminAuth } from "./admin-auth";

export async function verifySeesionCookie(sessionCookie : string) {
    adminAuth.verifySessionCookie(sessionCookie, true)
    .then((data) => {
        console.log(data);
    })
    .catch((err) => {
        console.log(err);
    })
}