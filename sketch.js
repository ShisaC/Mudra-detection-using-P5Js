let video;
let poseNet;
let poses = [];
let detectedMudra = "None";
let annotationAlpha = 0;

let mudraDescriptions = {
  'Pataka': "Flat hand — a gesture of stopping or blessing.",
  'Tripataka': "Three-part flag — symbolizes a crown or fire.",
  'Soochi': "Pointed needle — precise and focused gesture.",
  'Padmakosha': "Lotus bud — blossoming energy and beauty.",
  'Unknown': "Gesture not recognized.",
  'None': ""
};

function setup() {
  createCanvas(800, 600);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', function (results) {
    poses = results;
  });

  textFont('Georgia');
  textAlign(CENTER, CENTER);
  noFill();
  strokeWeight(2);
}

function modelLoaded() {
  console.log("PoseNet ready");
}

function draw() {
  image(video, 0, 0, width, height);
  drawKeypoints();

  if (poses.length > 0) {
    const pose = poses[0].pose;

    const ls = pose.leftShoulder;
    const le = pose.leftElbow;
    const lw = pose.leftWrist;

    const rs = pose.rightShoulder;
    const re = pose.rightElbow;
    const rw = pose.rightWrist;

    if (ls && le && lw) {
      detectMudra(ls, le, lw);
      annotateMudra(lw, detectedMudra);
    }

    if (rs && re && rw) {
      detectMudra(rs, re, rw);
      annotateMudra(rw, detectedMudra);
    }
  }
}

function drawKeypoints() {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      if (keypoint.score > 0.4) {
        fill(255, 100);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

function detectMudra(s, e, w) {
  const sw = dist(s.x, s.y, w.x, w.y);
  const angle = degrees(
    abs(atan2(w.y - e.y, w.x - e.x) -
        atan2(s.y - e.y, s.x - e.x))
  );
  const dirAngle = degrees(atan2(w.y - s.y, w.x - s.x));

  if (sw < 70 && angle > 70 && angle < 110) {
    detectedMudra = "Soochi";
  }
  else if (angle < 30 && dirAngle < -20 && sw > 120) {
    detectedMudra = "Tripataka";
  }
  else if (angle < 30 && sw > 80 && abs(dirAngle) < 60) {
    detectedMudra = "Pataka";
  }
  else if (angle > 40 && angle < 100 && sw > 100 && dirAngle > 30) {
    detectedMudra = "Padmakosha";
  }
  else {
    detectedMudra = "Unknown";
  }
}

function annotateMudra(pos, mudra) {
  push();
  let pulse = map(sin(frameCount * 0.1), -1, 1, 150, 255);
  textSize(20);
  fill(255, pulse);
  stroke(0, 180);
  strokeWeight(3);
  text(mudra, pos.x, pos.y - 50);

  textSize(14);
  noStroke();
  fill(255, 200);
  text(mudraDescriptions[mudra] || "", pos.x, pos.y - 25);
  pop();
}
