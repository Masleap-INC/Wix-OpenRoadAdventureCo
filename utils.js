
export function roundNumberV1(num, scale) {
    if(!("" + num).includes("e")) {
      return +(Math.round(Number(num + "e+" + scale))  + "e-" + scale);  
    } else {
      var arr = ("" + num).split("e");
      var sig = ""
      if(+arr[1] + scale > 0) {
        sig = "+";
      }
      var i = +arr[0] + "e" + sig + (+arr[1] + scale);
      var j = Math.round(Number(i));
      var k = +(j + "e-" + scale);
      return k;  
    }
  }
  
  export function roundNumberV2(num, scale) {
    if (Math.round(num) != num) {
      if (Math.pow(0.1, scale) > num) {
        return 0;
      }
      var sign = Math.sign(num);
      var arr = ("" + Math.abs(num)).split(".");
      if (arr.length > 1) {
        if (arr[1].length > scale) {
          var integ = +arr[0] * Math.pow(10, scale);
          var dec = integ + (+arr[1].slice(0, scale) + Math.pow(10, scale));
          var proc = +arr[1].slice(scale, scale + 1)
          if (proc >= 5) {
            dec = dec + 1;
          }
          dec = sign * (dec - Math.pow(10, scale)) / Math.pow(10, scale);
          return dec;
        }
      }
    }
    return num;
  }