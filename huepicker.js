/* ========================================================== 
*
* huepicker.js
*
* 2012 Franco Trimboli (@sunpazed)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* ========================================================== */

// Terrible global for Hue colour [R,G,B]
var hueColour = [0,0,0] 

// More globals for API - Here's where you config your light
// --------------------------------------------
//
// EDIT: Your API key here
var apikey = "91a5f7b9ac1f14e7ac196ea162cfa712" 
//
// EDIT: Which light we are controlling (hard coded to 3 here)
var lightnumber = "3"
//
// EDIT: Host URL endpoint for the REST API
var lighthost = "http://192.168.0.1:8000"
//
// URL string to control light 
var urlstr = lighthost + "/api/" + apikey + "/lights/" + lightnumber + "/state"
var state = false;

function makeHuePicker() {

    // make a canvas
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    // set up gradient
    var grad = ctx.createLinearGradient(0, 120,
    canvas.width, canvas.height);
    grad.addColorStop(0, '#fa6c0c');
    grad.addColorStop(0.08, '#f6300a');
    grad.addColorStop(0.21, '#d11b7e');
    grad.addColorStop(0.35, '#7425b1');
    grad.addColorStop(0.52, '#0a62da');
    grad.addColorStop(0.68, '#00c000');
    grad.addColorStop(0.82, '#f6ef2a');
    grad.addColorStop(0.99, '#fa6c0c');

    // fill rect
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
                
    // mind mouse to canvas to retrieve RGB
      $('canvas').bind('mousemove', function(event){
        var x = event.pageX - event.currentTarget.offsetLeft
        var y = event.pageY - event.currentTarget.offsetTop;
        var ctx = document.getElementById('canvas').getContext('2d');
        var imgd = ctx.getImageData(x, y, 1, 1);
        var data = imgd.data; 
        // retrieve RGB pixel under mouse
        var out = $('#result'); 
        hueColour = [data[0],data[1],data[2]]; 
        //update that global!
        var hexString = RGBtoHex(data[0],data[1],data[2]); 
        // convert to hex to update our button
        out.attr("style","background-color: #" + hexString + ";"); 
        // button changes to colour
      });
}

function updateHue() {

    // Log RGB
    console.log(hueColour);
    // Convert to XYZ colour space
    XY = toXY(hueColour[0],hueColour[1],hueColour[2]);
    // Log our XYZ colour conversion
    console.log(XY);

    // Create request (only XY set, what about brightness?)
    var request = {"bri": 255, "xy":[XY[0], XY[1]], "on": true}
    var jbulbs = JSON.stringify(request);
    console.log(jbulbs);

    // Hey Hue there, change for me please!
    $.ajax({
        data : jbulbs,
        contentType : 'application/json',
        type : 'PUT',
        url: urlstr, 
    });
    state = true;

}

// Helper functions
function RGBtoHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(N) {
      if (N==null) return "00";
      N=parseInt(N); if (N==0 || isNaN(N)) return "00";
      N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
      return "0123456789ABCDEF".charAt((N-N%16)/16) + "0123456789ABCDEF".charAt(N%16);
}

// RGB to XYZ colour space, via https://gist.github.com/30c50aa4b161f8169c3d
function toXY(R,G,B){

    var_R = ( R / 255 ) 
    var_G = ( G / 255 )
    var_B = ( B / 255 ) 
    if ( var_R > 0.04045 ) {
        var_R = Math.pow( ( ( var_R + 0.055 ) / 1.055 ), 2.4)
    } else {
        var_R = var_R / 12.92
    }
    if ( var_G > 0.04045 ) {
        var_G = Math.pow( ( ( var_G + 0.055 ) / 1.055 ), 2.4)
    } else {
        var_G = var_G / 12.92
    }
    if ( var_B > 0.04045 ) {
        var_B = Math.pow( ( ( var_B + 0.055 ) / 1.055 ), 2.4)
    } else {
        var_B = var_B / 12.92
    }                  

    var_R = var_R * 100
    var_G = var_G * 100
    var_B = var_B * 100

    X = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805
    Y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722
    Z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505

    X_new = X / ( X + Y + Z )
    Y_new = Y / ( X + Y + Z )

    // we discard Z .. hmm ? missing something here.
    return [X_new,Y_new]
}


