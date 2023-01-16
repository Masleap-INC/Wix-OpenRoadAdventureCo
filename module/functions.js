import {
    fetch
} from 'wix-fetch';
import {
    getSecret,
} from 'wix-secrets-backend';
import wixData from 'wix-data';
import wixStoresBackend from 'wix-stores-backend';
import { reformattingDescriptions, reformattingSpacifications } from "../parser.js";


// Urls properties
const baseUrl = "https://api.frontrunner.co.za/";
const endpoint = "customer/Pricelist/json/EUR/";
const language = "EN";
const colValues = ['Bom', 'Images', 'FittingInstructions', 'Categories', 'Narrative'];



// Get products from external sources
async function getData(url) {
    const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.json(); // parses JSON response into native JavaScript objects
}


async function retrieveAllProducts() {
    let results = await wixData.query("Stores/Products")
        .limit(100)
        .find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
}


// Create fetch url with apiKey and account 
// This url will be used for fetching products from external source
async function constructUrl() {
    const account = await getSecret("account");
    const apiKey = await getSecret("apiKey");
    const url = `${baseUrl}${endpoint}?account=${account}&ApiKey=${apiKey}&language=${language}&nonStandardColumns=${colValues[0]}&nonStandardColumns=${colValues[1]}&nonStandardColumns=${colValues[2]}&nonStandardColumns=${colValues[3]}&nonStandardColumns=${colValues[4]}`;
    return url;
}


// Update inventory
// https://api.frontrunner.co.za/customer/Edi/EUR?account=xyz&ApiKey=pqr&format=JSON
async function constructEDIUrl() {
    const account = await getSecret("account");
    const apiKey = await getSecret("apiKey");
    const url = `${baseUrl}customer/Edi/EUR?account=${account}&ApiKey=${apiKey}&format=JSON`;
    return url;
}


function getProductVariants(productId, options) {
  return wixStoresBackend.getProductVariants(productId, options);
}


function updateInventoryVariantFields(id, item) {
  return wixStoresBackend.updateInventoryVariantFieldsByProductId(id, item);
}


// This function will be called every 1 hours
export async function updateProductInventory() {

    // Get external source url
    const url = await constructEDIUrl();

    // GET response from the given url
    await getData(url).then(async (extrernalProducts) => {
       
        try {
            let internalProducts = await retrieveAllProducts();

            for (const [_, extProduct] of extrernalProducts.entries()) {

                if (internalProducts.length != 0) { 
                    var results = internalProducts.filter(function(intProduct) {
                        return extProduct.sku == intProduct.sku;
                    });

                    if (results.length != 0) {

                        let variants = await getProductVariants(results[0]._id);

                        let myVariantData = {
                            "trackQuantity": true,
                            "variants": [{
                                inStock: true,
                                "quantity": Math.floor( extProduct.totalOnHand ),
                                "variantId": variants[0]._id
                            }]
                        };

                        try {
                            updateInventoryVariantFields(results[0]._id, myVariantData);
                        }
                        catch (err) {
                            // handle the error
                        }

                    }
                }
            }
        } catch (Exception) {
            console.log(Exception);
        }

    });

}


// This function will be called every 1 hours
export async function updateProductsDescription() {
    // Get external source url
    const url = await constructUrl();

    // GET response from the given url
    await getData(url).then(async (extrernalProducts) => {

        try {
            let internalProducts = await retrieveAllProducts();

            for (const [_, extProduct] of extrernalProducts.entries()) {

                if (internalProducts.length != 0) {
                    var results = internalProducts.filter(function(intProduct) {
                        return extProduct.stockCode == intProduct.sku;
                    });

                    if (results.length != 0) {

                        // Data to be updated
                        let payload = {}
                        let is_updatable = false;

                        // Wix product
                        let wix_prod_name = results[0].name;
                        let wix_prod_description = results[0].description.trim();
                        let wix_prod_price = results[0].price;

                        // External product
                        let ext_prod_narrative = extProduct.narrative;
                        let ext_prod_description = extProduct.description;
                        let ext_prod_long_description = extProduct.longDescription;
                        let ext_prod_price = extProduct.price;

                        if (ext_prod_description.length > 80) {
                            ext_prod_description = ext_prod_description.substring(0, 77) + "...";
                        }
                            
                        try{
                            ext_prod_price = ext_prod_price + (ext_prod_price * 0.2)
                        }catch (e){
                            console.log(e)
                        }

                        ext_prod_long_description = `${ext_prod_narrative}<p><b>Descriptions:</b><br></p>${reformattingDescriptions(ext_prod_long_description)}<p></p>`;
                        ext_prod_long_description = ext_prod_long_description.replace(/\u00a0/g, " ").trim();

                        
                        if(wix_prod_name != ext_prod_description) {
                            payload['name'] = ext_prod_description
                            is_updatable = true;
                        }

                        if(wix_prod_price != ext_prod_price) {
                            payload['price'] = ext_prod_price
                            payload['discount'] = {"type": "NONE", "value":"0"}
                            is_updatable = true;
                            
                        }


                        if(wix_prod_description != ext_prod_long_description) {
                            payload['description'] = ext_prod_long_description;
                            is_updatable = true;
                        }

                        if(is_updatable) {
                            wixStoresBackend.updateProductFields(results[0]._id, payload)
                            console.log(extProduct.stockCode)
                        }

                    }
                }
            }
        } catch (Exception) {
            console.log(Exception);
        }

    });

}

