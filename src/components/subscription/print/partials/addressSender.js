export default (doc, address, startY, fontSize, lineSpacing) => {
    let startX = 57;
    const spaceBetweenLines = lineSpacing;  // Adjust the space between lines as needed

    //-------Sender Info Address---------------------
    doc.setFontSize(fontSize);

    address = Object.values(address);
    // @todo: more dynamic slice arrays
    const addressStart = address.slice(0, 4);
    const addressEnd = address.slice(4);

    addressStart.forEach(text => {
        if (text) {
            doc.text(text, startX, startY);
            startY += spaceBetweenLines;  // Move to the next line for the next address part
        }
    });

    // Reset startX for the next set of address lines
    startX = 57;
    addressEnd.forEach(text => {
        if (text) {
            doc.text(text, startX, startY);
            startY += spaceBetweenLines;  // Move to the next line for the next address part
        }
    });

    //-------Sender Info Draw Line and Graphic---------------------
    let endX = doc.internal.pageSize.width - startX;
    doc.setLineWidth(0.5);
    doc.line(startX, startY + spaceBetweenLines / 1.5, endX, startY + spaceBetweenLines / 1.5);

    return startY;
};
