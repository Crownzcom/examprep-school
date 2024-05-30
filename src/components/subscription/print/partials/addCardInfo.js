export default (doc, cardData, startY, fontSize, lineSpacing) => {
    const startX = 57;

    // Setting font for card information
    doc.setFont(doc.vars.fontFamily, doc.vars.fontWeightBold);

    // doc.setFont(doc.vars.fontFamily, doc.vars.fontWeightNormal);
    doc.setFontSize(fontSize);

    // Constructing card information
    const cardInfo = [
        `Card: ${cardData.first_6digits || ''}xxxxxx${cardData.last_4digits || ''}`,
        // `${cardData.issuer || ''}`,
        // `${cardData.country || ''}`,
        `Card Type: ${cardData.type || ''}`,
        // `Expiry: ${cardData.expiry || ''}`
    ];

    // Printing each line of card information
    cardInfo.forEach(info => {
        if (info) {
            doc.text(info, startX, startY += lineSpacing);
        }
    });

    return startY;
};
