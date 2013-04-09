function pie(datalist)
{
    var canvas = document.getElementById("chart"); 
    var ctx = canvas.getContext('2d');
    var colist = new Array('blue', 'red', 'green', 'orange', 'gray', 'yellow');
  var radius = canvas.height / 2 - 5;
  var centerx = canvas.width / 2;
  var centery = canvas.height / 2;
  var total = 0;
  for(x=0; x < datalist.length; x++) { total += datalist[x]; }; 
  var lastend=0;
  var offset = Math.PI / 2;
  for(x=0; x < datalist.length; x++)
  {
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
