import { Router } from "itty-router";
import { Databases, ID, Query } from "node-appwrite";
import { faker } from '@faker-js/faker'

const router = Router({ base: '/product' })

router.get('/empty', async (request, { res, client, log }) => {

    const limit = request.query.limit ?? 30
    client.setKey(process.env.APPWRITE_KEY)
    const DB_ID = process.env.APPWRITE_DATABASE_ID
    const PRODUCT_COLLECTION_ID = process.env.APPWRITE_PRODUCT_COLLECTION_ID
    const db = new Databases(client)

    const { documents } = await db.listDocuments(DB_ID, PRODUCT_COLLECTION_ID, [
        Query.limit(limit),
        Query.select(["$id"])
    ])

    log( await Promise.all(documents.map(async (d) => {
        await db.deleteDocument(DB_ID, PRODUCT_COLLECTION_ID, d.$id)
    })) )

    return res.send({ deleted: documents})

})

router.get('/create', async (request, { res, client, log }) => {

    client.setKey(process.env.APPWRITE_KEY)
    const DB_ID = process.env.APPWRITE_DATABASE_ID
    const PRODUCT_COLLECTION_ID = process.env.APPWRITE_PRODUCT_COLLECTION_ID
    const ATTRIBUTE_COLLECTION_ID = process.env.APPWRITE_ATTRIBUTE_COLLECTION_ID

    const db = new Databases(client)

    const numProducts = request.query.count ?? 1

    let products = [];

    do {
        const numPhotos = faker.number.int({ min: 1, max: 3 })
        const numAttr = faker.number.int({ min: 1, max: 4 })
        let photos = []
        let attributes = []

        do {
            photos.push(faker.image.url())
        } while(photos.length < numPhotos)

        do {
            let attrPhotos = []
            const numAttrPhotos = faker.number.int({ min:1, max: 5 })
            
            do {
                attrPhotos.push(faker.image.url())
            } while ( attrPhotos.length < numAttrPhotos )

            attributes.push({
                name: faker.commerce.productMaterial(),
                description: faker.commerce.productDescription(),
                stock: faker.number.int({ min: 0, max: 50 }),
                price: faker.number.int({ min: 50, max:300 }),
                images: attrPhotos
            })

        } while(attributes.length < numAttr)

        const product = {
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            photos: photos,
            attributes
        }

        products.push(product)

    } while(products.length < numProducts )

    log({
        products
    })

    const createProducts = await Promise.all(products.map( async p => {
        const result = await db.createDocument(DB_ID, PRODUCT_COLLECTION_ID, "unique()", {
            name: p.name,
            description: p.description,
            photos: p.photos
        } )
        return {
            ...result,
            attributes: p.attributes
        }
    }))

    log({
        createProducts
    })

    const createAttributesArray = createProducts.reduce( (pv, cv) => {
        cv.attributes.forEach(a => {
            pv.push({
                ...a,
                product: cv.$id
            })
        });
        return pv;
    }, [])
    
    log({
        createAttributesArray
    })

    const createAttributes = await Promise.all(createAttributesArray.map( async attr => {
        return await db.createDocument(DB_ID, ATTRIBUTE_COLLECTION_ID, "unique()", attr)
    }))
    
    log({
        createAttributes
    })

    return res.json({ products: createProducts, attributes: createAttributes })
})

export default router