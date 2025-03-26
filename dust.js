if (document.readyState !== "loading") {
  const spammer = new DustParticlesSpammm("container");
  spammer.start();
} else {
  document.addEventListener("DOMContentLoaded", function () {
    const spammer = new DustParticlesSpammm("container");
    spammer.start();
  });
}

const DEFAULT_CONFIG = [
  {
    count: 190,
    radius: 5,
    speed: 8,
    alpha: 0.1,
  },
  {
    count: 80,
    radius: 15,
    speed: 4,
    alpha: 0.07,
  },
  {
    count: 80,
    radius: 25,
    speed: 10,
    alpha: 0.07,
  },
  {
    count: 40,
    radius: 40,
    speed: 15,
    alpha: 0.05,
  },
  {
    count: 10,
    radius: 60,
    speed: 25,
    alpha: 0.04,
  },
];

class DustParticlesSpammm {
  constructor(containerId, config = DEFAULT_CONFIG) {
    if (!containerId) {
      throw new Error("containerId required!");
    }

    this.id = "dustParticleSpammm";
    this.config = config;
    this.frame = 0;
    this.container = document.getElementById(containerId);
    this.ctx = null;
    this.canvas = null;
    this.fps = 60;
    this.fpsInterval = 1000 / this.fps;
    this.then = Date.now();
    this.startTime = this.then;
    this.particles = [];
  }

  start() {
    this.prepareCanvas();
    this.initParticles();
    this.drawParticles();
  }

  prepareCanvas() {
    const dpr = window.devicePixelRatio;
    const containerRect = this.container.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.id = this.id;
    canvas.height = containerRect.height * dpr;
    canvas.width = containerRect.width * dpr;
    canvas.style.height = `${containerRect.height}px`;
    canvas.style.width = `${containerRect.width}px`;
    this.container.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  initParticles() {
    this.config.forEach(({ count, ...particleProps }) => {
      for (let i = 0; i < count; i++) {
        this.particles.push(new DustParticle(this.id, particleProps));
      }
    });
  }

  drawParticles() {
    requestAnimationFrame(() => this.drawParticles());
    const now = Date.now();
    const elapsed = now - this.then;

    if (elapsed > this.fpsInterval) {
      this.frame += 1;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles.forEach((particle) => particle.draw());
    }
  }
}

class DustParticle {
  constructor(canvasId, particleProps) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.initAlpha = particleProps?.alpha || 1;
    this.alpha = particleProps?.alpha || 1;
    this.speed = (particleProps?.speed || 5) / 1000;
    this.radius = particleProps?.radius || 10;
    this.lifeSpan = getRandomInt(300, 2000);
    this.cycle = 0;
    this.isAlive = true;
    this.position = {
      x: getRandomInt(0, this.canvas.width),
      y: getRandomInt(0, this.canvas.height),
    };
    this.vector = {
      x: getRandomInt(-100, 100) * this.speed,
      y: getRandomInt(-100, 100) * this.speed,
    };
  }

  draw() {
    this.cycle += 1;
    if (this.isAlive) {
      this.ctx.save();
      this.ctx.beginPath();
      var radgrad = this.ctx.createRadialGradient(
        this.position.x,
        this.position.y,
        0,
        this.position.x,
        this.position.y,
        this.radius
      );
      radgrad.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
      radgrad.addColorStop(0.7, `rgba(255,255,255,${this.alpha - 0.01})`);
      radgrad.addColorStop(1, `rgba(255,255,255,0.01)`);
      this.ctx.fillStyle = radgrad;
      this.ctx.arc(
        this.position.x,
        this.position.y,
        this.radius,
        0,
        Math.PI * 2,
        true
      );
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.restore();
    }
    this.update();
  }

  update() {
    if (this.lifeSpan - this.cycle <= 20) {
      this.alpha -= this.initAlpha / 20;
    } else if (this.isAlive && this.alpha < this.initAlpha) {
      this.alpha += this.initAlpha / 20;
    }
    if (this.cycle === this.lifeSpan) {
      this.isAlive = false;
      this.cycle = 1;
    }
    if (!this.isAlive && this.cycle > 60) {
      this.cycle = 1;
      this.isAlive = true;
      this.position = {
        x: getRandomInt(0, this.canvas.width),
        y: getRandomInt(0, this.canvas.height),
      };
    }
    this.position.x += this.vector.x + getRandomInt(-1, 1) / 10;
    this.position.y += this.vector.y + getRandomInt(-1, 1) / 10;
    if (this.position.x < -100 || this.position.x > this.canvas.width + 100) {
      this.vector.x *= -1;
    }
    if (this.position.y < -100 || this.position.y > this.canvas.height + 100) {
      this.vector.y *= -1;
    }
  }
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomPositionWithinCanvas = (ctx) => {
  return {
    x: getRandomInt(0, ctx.width),
    y: getRandomInt(0, ctx.height),
  };
};
