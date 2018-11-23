const xhr = new XMLHttpRequest();
xhr.overrideMimeType('text/xml');
let animating = false;
let doUpdate = false;

let timestamp;
let timestampOld;
let dynamicTexts = new Map();
function newDynText(name, x, y, maxWidth, fontsize, fontcolor) {
  let dynamicText = new createjs.Text(
    "",
    `${fontsize}px Helvetica`,
    fontcolor
  );
  dynamicText.x = x;
  dynamicText.y = y;
  dynamicText.maxWidth = maxWidth;
  dynamicText.textAlign = "center";
  dynamicTexts.set(name, dynamicText);
  return dynamicText;
}
function addMirroredDynamicText(name, mirrorName) {
  let dynamicText = dynamicTexts.get(mirrorName).clone();
  dynamicText.x = $("myCanvas").attr("width") - dynamicText.x;
  dynamicTexts.set(name, dynamicText);
  //clones parent?
  //board.addChild(dynamicText);
}

function pollHandler() {
  xhr.open('GET', 'streamcontrol.xml');
  xhr.send();
  xhr.onreadystatechange = function() {
    let xmlDoc = xhr.responseXML;
    if (xmlDoc != null) {
      timestampOld = timestamp;
      timestamp = getValueFromTag(xmlDoc, 'timestamp');
      if (timestamp != timestampOld) {
        doUpdate = true;
      }
      if (!animating && doUpdate) {
        dynamicTexts.forEach(updateText);
        doUpdate = false;
      }
    }
  }
}

function updateText(dynamicText, name, dynTexts) {
  let newText = getValueFromTag(xhr.responseXML, name);
  if (dynamicText.text != newText) {
    animating = true;
    createjs.Tween.get(dynamicText)
      .to({alpha:0},500,createjs.Ease.quintIn)
      .call(function() {dynamicText.text = newText;})
      .to({alpha:1},500,createjs.Ease.quintOut)
      .call(function() {animating = false;});
  }
}
