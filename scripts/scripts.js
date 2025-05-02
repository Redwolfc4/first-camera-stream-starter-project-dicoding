let width = 320;
let height = 0;

let streaming = false;

async function startup() {
  const cameraVideo = document.getElementById("camera-video");
  const cameraCanvas = document.getElementById("camera-canvas");
  const cameraTakeButton = document.getElementById("camera-take-button");
  const cameraListOutput = document.getElementById("camera-list-output");
  let number = null;

  function populateTakenPicture(image) {
    // TODO: show taken picture

    console.log(image);
    if (number) {
      number++;
    } else {
      number = 1;
    }
    temp_html = `
    <li>
      <img src="${image}" alt='data-${number}'>
    </li>
    `;
    cameraListOutput.insertAdjacentHTML("beforeEnd", temp_html);
  }

  async function getStream() {
    // TODO: generate camera stream
    try {
      return await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (error) {
      throw new Error(error);
    }
  }

  function cameraLaunch(stream) {
    // TODO: launch camera on video
    cameraVideo.srcObject = stream;
    cameraVideo.play();
  }

  function cameraTakePicture(width = 0, height = 0) {
    // TODO: draw video frame to canvas
    const context = cameraCanvas.getContext("2d");

    // atur ukuran canvas sesuai dengan video
    cameraCanvas.width = width;
    cameraCanvas.height = height;

    // ambil snapshot gambar dari video
    context.drawImage(cameraVideo, 0, 0, width, height);

    // dapatkan gambar canvas dalam bentuk data url dengan tipe image/png
    return cameraCanvas.toDataURL("image/png");
  }

  async function init() {
    // TODO: init
    try {
      const stream = await getStream();
      cameraLaunch(stream);
    } catch (error) {
      console.log(error);
      console.log("error occured: ", error.message);
    }
  }

  init();

  // saat camera video dimulai
  cameraVideo.addEventListener("canplay", () => {
    if (streaming) {
      return;
    }

    // calculate height dynamically
    height = (cameraVideo.videoHeight / cameraVideo.videoWidth) * width;

    // set video width and height
    cameraVideo.setAttribute("width", width.toString());
    cameraVideo.setAttribute("height", height.toString());

    // set canvas width and height
    cameraCanvas.setAttribute("width", width.toString());
    cameraCanvas.setAttribute("height", height.toString());

    streaming = true;
  });

  // saat tombol ambil gambar ditekan
  cameraTakeButton.addEventListener("click", () => {
    const imageUrl = cameraTakePicture(width, height); //dapatkan image url
    populateTakenPicture(imageUrl); //tampilka disini
  });
}

window.onload = startup;
