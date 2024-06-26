//import jsPDF from '../../node_modules/jspdf-yworks/dist/jspdf.debug';
import jsPDF from 'jspdf';
import addFontNormal from '../fonts/WorkSans-normal';
import addFontBold from '../fonts/WorkSans-bold';
import 'svg2pdf.js';
import fetchSvg from './utils/fetchSvg';
import { serverUrl } from '../../../config.js';
import addressSender from './partials/addressSender';
import addressCustomer from './partials/addressCustomer';
import addCardInfo from './partials/addCardInfo';
import heading from './partials/heading';
import table from './partials/table';
import totals from './partials/totals';
import text from './partials/text';
import footer from './partials/footer';
import logo from './partials/logo';

/**
 * @param {PrintData} printData
 * @returns {void}
 */
export function printPDF(printData) {
    // console.log('Data passed to receipt: ', printData);
    addFontNormal();
    addFontBold();

    const doc = new jsPDF('p', 'pt');
    doc.vars = {};
    doc.vars.fontFamily = 'WorkSans';
    doc.vars.fontWeightBold = 'bold';
    doc.vars.fontWeightNormal = 'normal';

    doc.setFont(doc.vars.fontFamily);

    // <><>><><>><>><><><><><>>><><<><><><><>
    // SETTINGS
    // <><>><><>><>><><><><><>>><><<><><><><>

    const fontSizes = {
        TitleFontSize: 14,
        SubTitleFontSize: 12,
        NormalFontSize: 10,
        SmallFontSize: 9
    };
    const lineSpacing = 12;

    let startY = 130; // bit more then 45mm

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const pageCenterX = pageWidth / 2;

    // <><>><><>><>><><><><><>>><><<><><><><>
    // COMPONENTS
    // <><>><><>><>><><><><><>>><><<><><><><>

    // <><>><><>><>><><><><><>>><><<><><><><>
    // Background init
    // need to print the background before other elements get printed on
    fetchSvg(`${serverUrl}/images/background.svg`).then(async ({ svg, width }) => {
        if (svg) {
            doc.setPage(1);

            doc.vars.bgImageWidth = width;
            doc.vars.bgImage = new XMLSerializer().serializeToString(svg);

            await doc.svg(svg, {
                x: pageCenterX - width / 2,
                y: 250
            });
        }

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Sender's address

        startY = addressSender(doc, printData.addressSender, startY, fontSizes.NormalFontSize, lineSpacing);

        const addressSvgLoaded = fetchSvg(`${serverUrl}/images/address-bar.svg`).then(({ svg, width, height }) => {
            doc.setPage(1);

            const xOffset = 225;
            const scale = 0.45; // scaling for finer details

            doc.svg(svg, {
                x: xOffset,
                y: 136,
                width: width * scale,
                height: height * scale
            });
        });
        // <><>><><>><>><><><><><>>><><<><><><><>
        // Customer address

        startY += 10;
        startY = addressCustomer(doc, printData.address, startY, fontSizes.NormalFontSize, lineSpacing);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Card Information
        if (printData.payment_type === 'card') {
            startY = addCardInfo(doc, printData.card, startY, fontSizes.NormalFontSize, lineSpacing);
        }

        // <><>><><>><>><><><><><>>><><<><><><><>
        // INVOICE DATA
        // <><>><><>><>><><><><><>>><><<><><><><>

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Invoicenumber, -date and subject
        // console.log('startY: ', startY)

        startY = heading(doc, printData, startY + 20, fontSizes, lineSpacing);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Table with items

        startY = await table(doc, printData, startY, fontSizes.NormalFontSize, lineSpacing);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Totals

        startY = await totals(doc, printData, startY, fontSizes.NormalFontSize, lineSpacing);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Text

        startY = await text(doc, printData.invoice.text, startY, fontSizes.NormalFontSize, lineSpacing);

        startY = `Card Number: ` + await text(doc, printData.personalInfo.bank.cardOrPhoneNumber, startY, fontSizes.NormalFontSize, 0.5);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Footer

        footer(doc, printData, fontSizes.SmallFontSize, lineSpacing);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // REPEATED PAGE COMPONENTS
        // <><>><><>><>><><><><><>>><><<><><><><>

        const pagesCount = doc.internal.getNumberOfPages();

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Fold Marks

        const foldX = 12;
        const foldMarksY = [288, 411, 585];
        let n = 0;

        while (n < pagesCount) {
            n++;

            doc.setPage(n);

            doc.setDrawColor(157, 183, 128);
            doc.setLineWidth(0.5);

            foldMarksY.map(valueY => {
                doc.line(foldX, valueY, foldX + 23, valueY);
            });
        }

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Logo

        const logoLoaded = logo(doc, printData, pagesCount);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Page Numbers

        if (pagesCount > 1) {
            n = 0;
            doc.setFontSize(fontSizes.SmallFontSize);

            while (n < pagesCount) {
                n++;

                doc.setPage(n);

                doc.text(n + ' / ' + pagesCount, pageCenterX, pageHeight - 20, 'center');
            }
        }

        // <><>><><>><>><><><><><>>><><<><><><><>
        // PRINT
        // <><>><><>><>><><><><><>>><><<><><><><>

        Promise.all([addressSvgLoaded, logoLoaded]).then(() => {
            doc.save(`receipt - ${printData.id}.pdf`);
        });
    });
}
