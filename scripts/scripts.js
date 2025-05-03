let width = 320;
let height = 0;

let streaming = false;
let currentStream;
let currentId;

async function startup() {
  const cameraVideo = document.getElementById("camera-video");
  const cameraCanvas = document.getElementById("camera-canvas");
  const cameraTakeButton = document.getElementById("camera-take-button");
  const cameraListOutput = document.getElementById("camera-list-output");
  const cameraListSelect = document.getElementById("camera-list-select");

  let number = null;

  /**
   * destroy camera beforely
   */

  function stopCurrentStream() {
    if (!(currentStream instanceof MediaStream)) {
      return;
    }

    currentStream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  async function populateCameraList() {
    try {
      // Get all available webcam
      const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();

      const list = enumeratedDevices.filter(
        (device) => device.kind === "videoinput"
      );

      cameraListSelect.innerHTML = list.reduce(
        (accumulator, device, currentIndex) => {
          return accumulator.concat(`
          <option value="${device.deviceId}" ${
            currentId === device.deviceId ? "selected" : ""
          }>
            ${device.label || `Camera ${currentIndex + 1}`}
          </option>
        `);
        },
        ""
      );
    } catch (error) {
      throw error;
    }
  }

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
      <a href="${image}" download="data-${number}.png">Downloads</a>
    </li>
    `;
    cameraListOutput.insertAdjacentHTML("beforeEnd", temp_html);
  }

  async function getStream(usingRear) {
    // TODO: generate camera stream
    try {
      // const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: usingRear ? "environment" : "user", //untuk kamera depan belakang
          // deviceId: { exact: !streaming ? undefined : cameraListSelect.value },
          aspectRatio: 16 / 9,
          // width: {
          //   min: 640,
          //   max: 1920,
          //   ideal: 1280,
          // },
          // height: {
          //   min: 480,
          //   max: 1080,
          //   ideal: 720,
          // },

          width: {
            min: 640,
            max: 1920,
            ideal: 1280,
          },
          height: {
            min: 480,
            max: 1080,
            ideal: 720,
          },
        },
      });

      // Show available camera after camera permission granted
      await populateCameraList(stream);

      return stream;
    } catch (error) {
      throw new Error(error);
    }
  }

  function cameraLaunch(stream) {
    // TODO: launch camera on video
    cameraVideo.srcObject = stream;
    cameraVideo.play();
  }

  async function cameraTakePicture(width = 0, height = 0) {
    // TODO: draw video frame to canvas
    const context = cameraCanvas.getContext("2d");

    // atur ukuran canvas sesuai dengan video
    cameraCanvas.width = width;
    cameraCanvas.height = height;

    // ambil snapshot gambar dari video
    context.drawImage(cameraVideo, 0, 0, width, height);

    // dapatkan gambar canvas dalam bentuk data url dengan tipe image/png
    // return cameraCanvas.toDataURL("image/png");

    // dapatkan gambar canvas dalam bentuk blob
    return new Promise((resolve, reject) => {
      cameraCanvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, "image/png");
    });
  }

  async function init() {
    // TODO: init
    try {
      const currentStream = await getStream();
      cameraLaunch(currentStream);

      currentStream.getVideoTracks().forEach((track) => {
        console.log(track.getSettings());
      });
    } catch (error) {
      console.log(error);
      alert("error occured: ", error.message);
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
  cameraTakeButton.addEventListener("click", async () => {
    const imageUrl = await cameraTakePicture(width, height); //dapatkan image url
    populateTakenPicture(imageUrl); //tampilka disini
  });

  // when camera list select changed
  cameraListSelect.addEventListener("change", async (event) => {
    console.log("Kamera:", event.target.value);
    currentId = event.target.value; //ambil id kamera yang dipilih

    try {
      stopCurrentStream();

      const currentStream = await getStream();
      cameraLaunch(currentStream);
    } catch (error) {
      console.log(error);
      console.log("error occured: ", error.message);
    }
  });
}

window.onload = startup;
