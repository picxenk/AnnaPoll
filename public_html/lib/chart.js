function pie(datalist)
{
    var canvas = document.getElementById("pieChart"); 
    var ctx = canvas.getContext('2d');
    var colist = new Array('#FFA438', '#B5B5B5', 'green', 'orange', 'gray', 'yellow');
    var radius = canvas.height / 2 - 5;
    var centerx = canvas.width / 2;
    var centery = canvas.height / 2;
    var total = 0;

    for(x=0; x < datalist.length; x++) { 
        total += datalist[x]; 
    } 

    var lastend=0;
    var offset = Math.PI / 2;
    
    for(x=0; x < datalist.length; x++) {
        var thispart = datalist[x]; 
        ctx.beginPath();
        ctx.fillStyle = colist[x];
        ctx.moveTo(centerx,centery);
        var arcsector = Math.PI * (2 * thispart / total);
        ctx.arc(centerx, centery, radius, lastend - offset, lastend + arcsector - offset, false);
        ctx.lineTo(centerx, centery);
        ctx.fill();
        ctx.closePath();        
        lastend += arcsector;   
    }
}

function barRect(ctx, x, y, w, h, selected, text) {
    if (selected) {
        ctx.fillStyle = "#FFA438";
    } else {
        ctx.fillStyle = "#999999";
    }
    ctx.fillRect(x, y-h, w, h);
    ctx.fillStyle = "black";
    ctx.fillText(text, x, y+w);
}

function bar(dataObject, maxKey) {
    var canvas = document.getElementById("barChart");
    var ctx = canvas.getContext('2d');

    var baseLineStartX = 0;
    var baseLineY = canvas.height-30;
    var baseLineEndX = canvas.width;
    var unit = canvas.width/16;

    ctx.beginPath();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "20px Arial";
    var barRectStartX = unit;
    var selected = null;
    var fullHeight = dataObject[maxKey];

    for (key in dataObject) {
        if (key == maxKey) selected = true;
        else selected = false;
        barRect(ctx, barRectStartX, baseLineY, unit*2, dataObject[key]/fullHeight*baseLineY, selected, key);
        // barRect(ctx, barRectStartX, baseLineY, unit*2, dataObject[key]*4, selected, key);
        barRectStartX = barRectStartX + unit*3;
    }

    ctx.strokeStyle = "#666666";
    ctx.lineWidth = 2;
    ctx.moveTo(baseLineStartX, baseLineY);
    ctx.lineTo(baseLineEndX, baseLineY);
    ctx.stroke();

    ctx.closePath();
}
