export function reformattingDescriptions(description) {
    let lines = description.split('\\\\n');
    lines = lines.filter(line => (line.trim()));
    let lis = '<ul>';
    lines.forEach(line => { lis += `<li>${line}</li>` })
    return lis += '</ul>';
}

export function reformattingSpacifications(space) {
    // Variables declerations
    let materialsUsedDoc, productDimensionsDoc, consistsOfDoc, weightDoc, finalSpaceDoc = '';
    var consOfKeys = ['Consist of:', 'Consists of:'], matUsedKey = 'Materials used:', prodDimenKeys = ['Product Dimensions:', 'Product dimensions:'], weightKey = 'Weight:';
    var consistsOfValue, materialsUsedValue, productDimensionsValue, weightValue;

    // Breakdown spaces based on keyowards
    let keyowards = space.split(/(Consists of:|Consist of:|Materials used:|Product Dimensions:|Product dimensions:|Weight:)/);
    keyowards = keyowards.filter(line => (line.trim()))

    // finding consistsOf, Formating consistsOf space and restore consistsOfLines quantitiy
    if (keyowards.includes(consOfKeys[0]))
        consistsOfValue = keyowards[keyowards.indexOf(consOfKeys[0]) + 1]

    if (keyowards.includes(consOfKeys[1]))
        consistsOfValue = keyowards[keyowards.indexOf(consOfKeys[1]) + 1]

    if (consistsOfValue) {
        try {
            let consistsOfLines = consistsOfValue.split("\\\\n").join('').split(consistsOfValue.includes(' x ') ? /[0-9]\sx\s/: /[0-9]x\s/);
            consistsOfLines = consistsOfLines.filter(line => (line.trim()));
            consistsOfDoc = `<p><b>${consOfKeys[0]}</b><br>`;
            consistsOfLines.forEach(line => {
                let index = consistsOfValue.indexOf(line.trim());
                index -= consistsOfValue.includes(' x ') ? 4 : 3;
                consistsOfDoc += `${(consistsOfValue[index] + ' x ' + line.split("\\\\n").join('')).trim()}<br>`; 
            })
            consistsOfDoc += '</p>';
        } catch (_) {
            consistsOfDoc = `<p><b>${consOfKeys[0]}</b><br>${consistsOfValue}</p>`;
        }
        finalSpaceDoc += `${consistsOfDoc}<br>`;
    }


    // finding and Formating materialsUsed space
    if (keyowards.includes(matUsedKey)) {
        materialsUsedValue = keyowards[keyowards.indexOf(matUsedKey) + 1]
        try {
            materialsUsedValue = materialsUsedValue.replace('\\n', '')
            let materialsUsedLines = materialsUsedValue.split(/(Awning: |Awning Bag: |Poles: )/);
            var [awningKey, Awning, awningBagKey, awningBag, polesKey, poles] = materialsUsedLines.filter(line => (line.trim()));
            materialsUsedDoc = `<p><b>${matUsedKey}</b><br>${awningKey}${Awning}<br>${awningBagKey}${awningBag}<br>${polesKey}${poles.replace('\\\\n', '')}</p>`;
        } catch (_) {
            materialsUsedDoc = `<p><b>${matUsedKey}</b><br>${materialsUsedValue}</p>`;
        }
        finalSpaceDoc += `${materialsUsedDoc}<br>`;
    }



    // Finding and Formating productDimensions space
    if (keyowards.includes(prodDimenKeys[0]))
        productDimensionsValue = keyowards[keyowards.indexOf(prodDimenKeys[0]) + 1]

    if (keyowards.includes(prodDimenKeys[1]))
        productDimensionsValue = keyowards[keyowards.indexOf(prodDimenKeys[1]) + 1]

    if (productDimensionsValue) {
        try {
            productDimensionsValue = productDimensionsValue.split("\\\\n").join('')
            let productDimensionsLines = productDimensionsValue.split(/(Closed:|Open:)/);
            var [closedKey, closed, openKey, open] = productDimensionsLines.filter(line => (line.trim()));
            productDimensionsDoc = `<p><b>${prodDimenKeys[0]}</b><br>${closedKey}<br>${closed.replace('\\\\n', '')}<br><br>${openKey}<br>${open.replace('\\\\n', '')}</p>`;
        } catch (_) {
            try {
                productDimensionsValue = productDimensionsValue.split("\\\\n").join('')
                let productDimensionsLines = productDimensionsValue.split(/(Folded:|Unfolded:|Seat Height:|Load Capacity:)/);
                var [foldedKey, foldedValue, unfoldedKey, unfoldedValue, seatKey, seatValue, loadKey, loadValue] = productDimensionsLines.filter(line => (line.trim()));
                productDimensionsDoc = `<p><b>${prodDimenKeys[0]}</b><br>${foldedKey} ${foldedValue.replace('\\\\n', '')}<br>${unfoldedKey}${unfoldedValue.replace('\\\\n', '')}<br>${seatKey}${seatValue.replace('\\\\n', '')}<br>${loadKey}${loadValue.replace('\\\\n', '')}</p>`;
            } catch (_) {
                productDimensionsDoc = `<p><b>${prodDimenKeys[0]}</b><br>${productDimensionsValue.split("\\\\n").join('')}</p>`;
            }
        }
        finalSpaceDoc += `${productDimensionsDoc}<br>`;
    }

    //console.log(productDimensionsDoc)


    // Finding and Formating weight space
    if (keyowards.includes(weightKey)) {
        weightValue = keyowards[keyowards.indexOf(weightKey) + 1]
        weightDoc = `<p><b>${weightKey}</b><br>${weightValue}</p>`;
        finalSpaceDoc += weightDoc;
    }

    finalSpaceDoc.split("\\\\n").join('')
    return finalSpaceDoc;
}



// let counterF = 0;
// let counterS = 0;

// for (const [index, product] of jsonData.entries()) {
//     if (index >= 50 && index <= 100)
//     //if (product.stockCode == "AWNI090")
//         try {
//             let longDescription = product.longDescription;
//             let narrative = product.narrative;
//             let specifications = product.specifications;
//             let productDescription = `${narrative}<p><b>Descriptions:</b><br>${reformattingDescriptions(longDescription)}<br><b>Spacifications:</b>${reformattingSpacifications(specifications, product.stockCode)}</p>`.replaceAll('\\\\n', '')

//             counterS++;
//             console.log(productDescription + '<hr>');
//         } catch (e) {
//             counterF++;
//             //console.log(product.stockCode);
//             console.log(e)
//         }
// }
