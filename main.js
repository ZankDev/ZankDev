const imagesToLoad = ["wild", "Pegasus", "bonus", "shild", "eye", "Grape", "urm"];
let loaded = 0;
const images = {};

function hideLoading() {
  document.getElementById('loadingScreen').classList.add('hidden');
  document.getElementById('gameWrapper').classList.remove('hidden');
}

imagesToLoad.forEach(name => {
  const img = new Image();
  img.onload = () => {
    loaded++;
    images[name] = img;
    if (loaded === imagesToLoad.length) startGame();
  };
  img.src = `./assets/${name}.png`;
});

class Reel {
  constructor(x, ctx) {
    this.symbols = [];
    this.ctx = ctx;
    this.x = x;
    this.offset = 0;
    this.speed = 0;
    this.stopping = false;
  }

  spin() {
    this.speed = 20 + Math.random() * 10;
    this.stopping = false;
  }

  update() {
    if (this.stopping && this.speed > 0.5) {
      this.speed *= 0.95;
    } else if (this.stopping) {
      this.speed = 0;
    }
    this.offset += this.speed;
    if (this.offset > 256) {
      this.offset = 0;
      this.symbols.unshift(this.getRandomSymbol());
      this.symbols.pop();
    }
  }

  draw() {
    for (let i = 0; i < 3; i++) {
      const symbol = images[this.symbols[i]];
      if (!symbol) continue;
      this.ctx.drawImage(symbol, this.x, i * 256 - this.offset, 256, 256);
    }
  }

  stop() {
    this.stopping = true;
  }

  getRandomSymbol() {
    const keys = Object.keys(images);
    return keys[Math.floor(Math.random() * keys.length)];
  }
}

let reels = [];
let ctx;

function startGame() {
  hideLoading();
  const canvas = document.getElementById("slotCanvas");
  ctx = canvas.getContext("2d");

  for (let i = 0; i < 5; i++) {
    const reel = new Reel(i * 260, ctx);
    reel.symbols = ["wild", "Pegasus", "bonus"];
    reels.push(reel);
  }

  document.getElementById("spinBtn").addEventListener("click", () => {
    reels.forEach((reel, i) => {
      setTimeout(() => reel.spin(), i * 200);
      setTimeout(() => reel.stop(), 2000 + i * 300);
    });
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    reels.forEach(r => {
      r.update();
      r.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

function flashLightning(ctx) {
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(0, 0, 1280, 720);
  setTimeout(() => ctx.clearRect(0, 0, 1280, 720), 150);
}

function triggerBonusEffect(ctx) {
  let i = 0;
  const interval = setInterval(() => {
    ctx.fillStyle = i % 2 === 0 ? 'gold' : 'transparent';
    ctx.fillRect(0, 0, 1280, 720);
    i++;
    if (i > 4) clearInterval(interval);
  }, 100);
}

function getMultiplier(symbol, count) {
  const data = {
    wild: [20, 75, 250],
    Pegasus: [10, 25, 100],
    bonus: [0, 0, 0],
    shild: [5, 10, 30],
    eye: [2, 6, 20],
    Grape: [1, 2, 6],
    urm: [1, 2, 6]
  };
  const arr = data[symbol];
  return arr[count - 3];
}

function showWin(amount) {
  if (!amount) return;
  flashLightning(ctx);
}

function evaluateWin() {
  const result = reels.map(r => r.symbols[1]);
  const first = result[0];
  const count = result.filter(s => s === first).length;
  if (count >= 3) {
    const winValue = getMultiplier(first, count);
    showWin(winValue);
    if (first === 'bonus') triggerBonusEffect(ctx);
    if (first === 'wild') flashLightning(ctx);
  }
}
