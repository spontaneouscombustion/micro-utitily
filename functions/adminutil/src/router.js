import { Router } from 'itty-router'
import userRouter from './route/user.js'
import productRouter from './route/product.js'

const router = Router()

router
  .get('/', (request, { res, log }) => { 
    log({ request })
    return res.send("Homepage")
  })
  .all('/user/*', userRouter.handle)
  .all('/product/*', productRouter.handle)
  .all('*', (request, { res }) => res.send("Page not found", 404))


export default router