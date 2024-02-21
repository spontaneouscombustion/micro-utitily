import { Router } from "itty-router";

const router = Router({ base: '/user' })

router.get('/create', (request, { res, client }) => {

    return res.send("User route")
})

export default router