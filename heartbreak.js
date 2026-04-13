const loadingScreen = document.getElementById("loadingScreen");
const memoryImage = document.getElementById("memoryImage");
const imageCaption = document.getElementById("imageCaption");
const endMessage = document.getElementById("endMessage");
const playBtn = document.getElementById("playBtn");

const imagePaths = [];
let currentIndex = 0;
let slideInterval = null;
let isPlaying = false;
let shownSlides = 0;
let endShown = false;

async function detectImages(maxCount = 10) {
  const folders = ["", "images", "img"];
  const extensions = ["jpg", "jpeg", "png", "JPG", "JPEG", "PNG"];
  const checks = [];
  for (let i = 1; i <= maxCount; i += 1) {
    checks.push(
      new Promise((resolve) => {
        let folderIndex = 0;
        let extIndex = 0;

        const tryNext = () => {
          if (folderIndex >= folders.length) {
            resolve(null);
            return;
          }

          if (extIndex >= extensions.length) {
            extIndex = 0;
            folderIndex += 1;
            tryNext();
            return;
          }

          const basePath = folders[folderIndex];
          const src = basePath ? `${basePath}/${i}.${extensions[extIndex]}` : `${i}.${extensions[extIndex]}`;
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => {
            extIndex += 1;
            tryNext();
          };
          img.src = src;
        };

        tryNext();
      })
    );
  }
  const results = await Promise.all(checks);
  return results.filter(Boolean);
}

function updateSlide() {
  if (imagePaths.length === 0) {
    imageCaption.textContent = "No images found beside HTML (or img/images folders).";
    memoryImage.classList.remove("visible");
    return;
  }

  memoryImage.classList.remove("visible");
  setTimeout(() => {
    memoryImage.src = imagePaths[currentIndex];
    memoryImage.onload = () => memoryImage.classList.add("visible");
    imageCaption.textContent = `Memory ${currentIndex + 1} of ${imagePaths.length}`;
    currentIndex = (currentIndex + 1) % imagePaths.length;
    shownSlides += 1;

    if (shownSlides >= imagePaths.length && !endShown) {
      endShown = true;
      clearInterval(slideInterval);
      isPlaying = false;
      playBtn.textContent = "Play Memories";
      setTimeout(showEndMessage, 2200);
    }
  }, 180);
}

function showEndMessage() {
  memoryImage.classList.remove("visible");
  endMessage.classList.add("show");
  imageCaption.textContent = "The end.";
}

function startSlideshow() {
  if (isPlaying) return;
  if (imagePaths.length === 0) {
    updateSlide();
    return;
  }
  if (endShown) {
    endShown = false;
    shownSlides = 0;
    currentIndex = 0;
    endMessage.classList.remove("show");
  }
  isPlaying = true;
  playBtn.textContent = "Pause Memories";
  updateSlide();
  slideInterval = setInterval(updateSlide, 2000);
}

function pauseSlideshow() {
  isPlaying = false;
  playBtn.textContent = "Play Memories";
  clearInterval(slideInterval);
}

playBtn.addEventListener("click", () => {
  if (isPlaying) {
    pauseSlideshow();
  } else {
    startSlideshow();
  }
});

function initParticles() {
  const canvas = document.getElementById("particlesCanvas");
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.min(90, Math.floor((canvas.width * canvas.height) / 18000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.8,
      speedY: Math.random() * 0.5 + 0.2,
      alpha: Math.random() * 0.5 + 0.2
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y -= p.speedY;
      if (p.y < -4) {
        p.y = canvas.height + 4;
        p.x = Math.random() * canvas.width;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(216, 180, 254, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
}

async function initPage() {
  imageCaption.textContent = "Detecting images from root folder (jpg/jpeg/png)...";
  imagePaths.push(...(await detectImages(10)));
  startSlideshow();
  initParticles();

  setTimeout(() => {
    loadingScreen.classList.add("hide");
  }, 850);
}

initPage();
