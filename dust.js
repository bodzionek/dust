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
    count: 80,
    radius: 5,
    speed: 8,
    alpha: 0.15,
  },
  {
    count: 80,
    radius: 5,
    speed: 2,
    alpha: 0.08,
  },
  {
    count: 80,
    radius: 5,
    speed: 6,
    alpha: 0.09,
  },
  {
    count: 60,
    radius: 15,
    speed: 4,
    alpha: 0.05,
  },
  {
    count: 40,
    radius: 25,
    speed: 5,
    alpha: 0.04,
  },
  {
    count: 20,
    radius: 40,
    speed: 12,
    alpha: 0.03,
  },
  {
    count: 10,
    radius: 60,
    speed: 10,
    alpha: 0.02,
  },
  {
    count: 3,
    radius: 90,
    speed: 25,
    alpha: 0.01,
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
    this.initRadius = particleProps?.radius || 10;
    this.radius = particleProps?.radius || 10;
    this.lifeSpan = 0;
    this.spawnDelay = 0;
    this.cycle = 0;
    this.isAlive = false;
    this.isSpawning = false;
    this.isDying = false;
    this.position = null;
    this.vector = null;

    this.initParticleValues();
  }

  initParticleValues() {
    this.lifeSpan = getRandomInt(300, 2000);
    this.spawnDelay = getRandomInt(100, 500);
    this.isSpawning =
      this.radius < this.initRadius || this.alpha < this.initAlpha;
    this.isAlive = true;
    this.isDying = false;
    this.cycle = 0;
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
        Math.max(this.radius - 1, 0)
      );
      radgrad.addColorStop(0, `rgba(255,255,255,0.01)`);
      radgrad.addColorStop(0.9, `rgba(255,255,255,${this.alpha})`);
      radgrad.addColorStop(
        1,
        `rgba(255,255,255,${Math.max(this.alpha - 0.02, 0.01)})`
      );
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
    if (this.isAlive && this.lifeSpan - this.cycle <= 120) {
      this.isDying = true;
    }
    if (!this.isAlive && this.cycle >= this.spawnDelay) {
      this.initParticleValues();
    }
    if (this.isAlive) {
      this.updateColorAndSize();
      this.updatePositionAndVector();
    }
  }

  updateColorAndSize() {
    if (!this.isAlive) return;

    if (this.isSpawning) {
      this.alpha = Math.min(this.alpha + this.initAlpha / 120, this.initAlpha);

      if (this.alpha >= this.initAlpha) {
        this.isSpawning = false;
      }
      return;
    }

    if (this.isDying) {
      this.alpha = Math.max(this.alpha - this.initAlpha / 120, 0);

      if (this.alpha === 0) {
        this.isDying = false;
        this.isAlive = false;
        this.cycle = 1;
      }

      return;
    }

    const randomizer = getRandomInt(0, 10);
    const modifier = randomizer === 10 ? -1 : randomizer === 9 ? 1 : 0;
    const newRadius = this.radius + (this.initRadius / 60) * modifier;
    const newAlpha = this.alpha + (this.initAlpha / 120) * modifier;
    if (modifier === -1) {
      this.radius = Math.max(newRadius, this.initRadius * 0.5);
      this.alpha = Math.max(newAlpha, this.initAlpha - 0.02);
    } else {
      this.radius = Math.min(newRadius, this.initRadius * 1.3);
      this.alpha = Math.min(newAlpha, this.initAlpha + 0.02);
    }
  }

  updatePositionAndVector() {
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
