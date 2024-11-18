import $ from 'jquery';
import _ from 'lodash';
import * as d3 from 'd3';
import { lineWidthScale } from '../GlobalStyles';

const drawPaths = (mode, svgContainer, svg, fromPanelID, toPanelID, fromCats, toCats, lineColorScale) => {
    const commonCats = _.intersectionBy(fromCats, toCats, 'name');

    const drawPath = (svg, cat, path, startX, startY, startRatio, endRatio, endX, endY) => {
        // Set base and end widths for the path
        const startWidth = lineWidthScale(startRatio);
        const endWidth = lineWidthScale(endRatio);
        const algoEffScore = (mode == 'within-me') ? cat.measures.filterBubble : cat.measures.popularityBias;
        
        // Check SVG size
        if (svg.attr('height') < endY) svg.attr('height', endY);
        if (svg.attr('width') < (startX + endWidth)) svg.attr('width', (startX + endWidth));
        if (svg.attr('width') < (endX + endWidth)) svg.attr('width', (endX + endWidth));

        // Calculate control points for extremely smooth curves
        const controlPoint1X = startX + (endX - startX) * 0.9; // First control point moved to 45%
        const controlPoint1Y = startY - (endY - startY) * 0.1; // Small vertical offset for smoother start
        
        const controlPoint2X = startX + (endX - startX) * 0.01; // Second control point moved to 55%
        const controlPoint2Y = endY + (endY - startY) * 0.1; // Small vertical offset for smoother end

        // Calculate angle for perpendicular offsets
        const angle = Math.atan2(endY - startY, endX - startX);
        const perpendicular = angle + Math.PI / 2;

        // Calculate offsets for the start
        const topStartOffsetX = startX + Math.cos(perpendicular) * (startWidth / 2);
        const topStartOffsetY = startY + Math.sin(perpendicular) * (startWidth / 2);
        const bottomStartOffsetX = startX + Math.cos(perpendicular + Math.PI) * (startWidth / 2);
        const bottomStartOffsetY = startY + Math.sin(perpendicular + Math.PI) * (startWidth / 2);
        
        // Calculate offsets for the end
        const topEndOffsetX = endX + Math.cos(perpendicular) * (endWidth / 2);
        const topEndOffsetY = endY + Math.sin(perpendicular) * (endWidth / 2);
        const bottomEndOffsetX = endX + Math.cos(perpendicular + Math.PI) * (endWidth / 2);
        const bottomEndOffsetY = endY + Math.sin(perpendicular + Math.PI) * (endWidth / 2);

        // Calculate control points with more gradual width transition
        const width1 = startWidth + (endWidth - startWidth) * 0.45;
        const width2 = startWidth + (endWidth - startWidth) * 0.55;

        const topControl1X = controlPoint1X + Math.cos(perpendicular) * (width1 / 2);
        const topControl1Y = controlPoint1Y + Math.sin(perpendicular) * (width1 / 2);
        const bottomControl1X = controlPoint1X + Math.cos(perpendicular + Math.PI) * (width1 / 2);
        const bottomControl1Y = controlPoint1Y + Math.sin(perpendicular + Math.PI) * (width1 / 2);

        const topControl2X = controlPoint2X + Math.cos(perpendicular) * (width2 / 2);
        const topControl2Y = controlPoint2Y + Math.sin(perpendicular) * (width2 / 2);
        const bottomControl2X = controlPoint2X + Math.cos(perpendicular + Math.PI) * (width2 / 2);
        const bottomControl2Y = controlPoint2Y + Math.sin(perpendicular + Math.PI) * (width2 / 2);

        // Create the path with maximally smooth curves
        const pathData = `
            M ${topStartOffsetX},${topStartOffsetY}
            C ${topControl1X},${topControl1Y}
              ${topControl2X},${topControl2Y}
              ${topEndOffsetX},${topEndOffsetY}
            L ${bottomEndOffsetX},${bottomEndOffsetY}
            C ${bottomControl2X},${bottomControl2Y}
              ${bottomControl1X},${bottomControl1Y}
              ${bottomStartOffsetX},${bottomStartOffsetY}
            Z
        `;

        // Apply the path data and styling
        path.attr('d', pathData);
        path.attr('fill', 
            ((mode == 'between-me-and-others') 
                && ((algoEffScore >= 0) && (algoEffScore < 0.1))) 
            ? 'none' 
            : lineColorScale(algoEffScore)
        );
        path.attr('stroke', 'none');
        path.attr('opacity', 0.8)
        svg.append(path);
    }

    const connectElements = (svgContainer, svg, cat, fromCat, toCat, path, startElem, endElem) => {
        // if first element is lower than the second, swap!
        if(startElem.offset().left > endElem.offset().left){
            var temp = startElem;
            startElem = endElem;
            endElem = temp;
        }

        // get (top, left) corner coordinates of the svg container   
        const svgTop = svgContainer.offset().top;
        const svgLeft = svgContainer.offset().left;

        // calculate path's start (x,y) coords
        const startCoord = startElem.offset();
        const endCoord = endElem.offset();
        
        const startX = startCoord.left + startElem.outerWidth() - svgLeft - 25;
        const startY = startCoord.top + 0.5 * startElem.outerHeight() - svgTop;
        const endX = endCoord.left - svgLeft + 25;
        const endY = endCoord.top + 0.5 * endElem.outerHeight() - svgTop;
        const startRatio = fromCat.ratio;
        const endRatio = toCat.ratio;

        drawPath(svg, cat, path, startX, startY, startRatio, endRatio, endX, endY);
    }

    const connectAll = (svgContainer, svg, fromPanelID, toPanelID, fromCats, toCats, commonCats) => {
        commonCats.forEach(cat => {
            const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const fromCat = fromCats.filter(fromCat => fromCat.name == cat.name)[0];
            const toCat  = toCats.filter(toCat => toCat.name == cat.name)[0];
            $(newPath).attr({
                id: `path-from-actual-to-pred-user-${cat.name}`,
                class: 'path',
                fill: 'none'
            });
            connectElements(
                svgContainer, 
                svg, 
                cat, 
                fromCat,
                toCat,
                $(newPath), 
                $(`.${fromPanelID}` + `.${cat.name}`), 
                $(`.${toPanelID}` + `.${cat.name}`)
            );
        });
    }

    connectAll(svgContainer, svg, fromPanelID, toPanelID, fromCats, toCats, commonCats);
}

export default drawPaths;