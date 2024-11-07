import $ from 'jquery';
import _ from 'lodash';
import * as d3 from 'd3'

// Reference: https://jsfiddle.net/bbcfk164/
// https://gist.github.com/alojzije/11127839
const drawPaths = (svg, catsActualUser, catsPredUser, miscalibrationScale) => {
    const commonCatsWithinMe = _.intersectionBy(catsActualUser, catsPredUser, 'name');

    //helper functions, it turned out chrome doesn't support Math.sgn() 
    function signum(x) {
        return (x < 0) ? -1 : 1;
    }
    function absolute(x) {
        return (x < 0) ? -x : x;
    }

    function drawPath(svg, cat, path, startX, startY, endX, endY) {
        // get the path's stroke width (if one wanted to be really precize, one could use half the stroke size)
        var stroke =  parseFloat(path.attr('stroke-width'));
        // check if the svg is big enough to draw the path, if not, set heigh/width
        if (svg.attr('height') <  endY)                 svg.attr('height', endY);
        if (svg.attr('width' ) < (startX + stroke) )    svg.attr('width', (startX + stroke));
        if (svg.attr('width' ) < (endX   + stroke) )    svg.attr('width', (endX   + stroke));
        
        var deltaX = (endX - startX) * 0.1;
        var deltaY = (endY - startY) * 0.1;
        // for further calculations which ever is the shortest distance
        var delta  =  deltaX < absolute(deltaY) ? deltaX : absolute(deltaY);

        // set sweep-flag (counter/clock-wise)
        // if start element is closer to the left edge,
        // draw the first arc counter-clockwise, and the second one clock-wise
        var arc1 = 0; var arc2 = 1;
        if (startY > endY) {
            arc1 = 1;
            arc2 = 0;
        }

        // Calculate control points for the Bézier curve
        var midX = (startX + endX) / 2;
        var controlY = (startY + endY) / 2;
        var controlPoint1X = midX;
        var controlPoint1Y = startY;
        var controlPoint2X = midX;
        var controlPoint2Y = endY;

        // Draw the smooth S-curve using cubic Bézier
        path.attr('d', `M${startX},${startY} ` +
                    `C${controlPoint1X},${controlPoint1Y} ` +
                    `${controlPoint2X},${controlPoint2Y} ` +
                    `${endX},${endY}`);
        path.attr('stroke', d3.color(miscalibrationScale(cat.measures.miscalibration)).darker(1));
        path.attr('stroke-width', 6);
        svg.append(path);
    }

    function connectElements(svg, cat, path, startElem, endElem) {
        var svgContainer= $('#svgContainer');

        // if first element is lower than the second, swap!
        if(startElem.offset().left > endElem.offset().left){
            var temp = startElem;
            startElem = endElem;
            endElem = temp;
        }

        // get (top, left) corner coordinates of the svg container   
        var svgTop  = svgContainer.offset().top;
        var svgLeft = svgContainer.offset().left;

        // get (top, left) coordinates for the two elements
        var startCoord = startElem.offset();
        var endCoord   = endElem.offset();

        // calculate path's start (x,y)  coords
        // we want the x coordinate to visually result in the element's mid point
        var startX = startCoord.left + startElem.outerWidth() - svgLeft;    // x = left offset + 0.5*width - svg's left offset
        var startY = startCoord.top  + 0.5*startElem.outerHeight() - svgTop;        // y = top offset + height - svg's top offset

        // calculate path's end (x,y) coords
        var endX = endCoord.left - svgLeft;
        var endY = endCoord.top + 0.5*endElem.outerHeight() - svgTop;

        // call function for drawing the path
        drawPath(svg, cat, path, startX, startY, endX, endY);
    }

    function connectAll(svg, commonCatsWithinMe) {
        commonCatsWithinMe.forEach(cat => {
            const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            $(newPath).attr({
                id: `path-from-actual-to-pred-user-${cat.name}`,
                class: 'path',
                stroke: 'none',
                'stroke-width': 0,
                fill: 'none'
            });
            connectElements(svg, cat, $(newPath), $('.actualUser' + `.${cat.name}`),   $('.predUser' + `.${cat.name}`));
        });
    }

    connectAll(svg, commonCatsWithinMe);
}

export default drawPaths;