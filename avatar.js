/**
 * avatar.js - Stickman Avatar Drawing and Animation System
 * Works in Codespaces with safe pose loading and Play/Reset buttons
 */

class StickmanAvatar {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Animation properties
        this.animationId = null;
        this.currentPose = null;
        this.targetPose = null;
        this.interpolationProgress = 0;
        this.interpolationSpeed = 0.05;

        // Pose data
        this.poses = null;

        // Stickman styling
        this.lineWidth = 3;
        this.headRadius = 20;
        this.jointRadius = 4;
        this.primaryColor = '#667eea';
        this.secondaryColor = '#764ba2';

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        await this.loadPoses();

        this.setPose('idle'); // fallback pose
        this.animate();

        console.log("Stickman initialized!");
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight, 400);
        this.canvas.width = size;
        this.canvas.height = size;
        console.log("Canvas resized:", size, size);
    }

    async loadPoses() {
        try {
            console.log("Loading poses.json...");
            const response = await fetch('poses.json');
            const data = await response.json();
            this.poses = data.poses;
            console.log("Loaded poses:", Object.keys(this.poses));
        } catch (err) {
            console.warn("Failed to load poses.json, using fallback idle pose.", err);
            this.poses = {
                idle: {
                    frames: [{
                        head: { x: 200, y: 80 },
                        neck: { x: 200, y: 110 },
                        leftShoulder: { x: 170, y: 120 },
                        rightShoulder: { x: 230, y: 120 },
                        leftElbow: { x: 160, y: 160 },
                        rightElbow: { x: 240, y: 160 },
                        leftWrist: { x: 160, y: 200 },
                        rightWrist: { x: 240, y: 200 },
                        spine: { x: 200, y: 180 },
                        hip: { x: 200, y: 220 },
                        leftHip: { x: 180, y: 220 },
                        rightHip: { x: 220, y: 220 },
                        leftKnee: { x: 180, y: 270 },
                        rightKnee: { x: 220, y: 270 },
                        leftAnkle: { x: 180, y: 320 },
                        rightAnkle: { x: 220, y: 320 }
                    }]
                }
            };
        }
    }

    setPose(poseName) {
        if (!this.poses[poseName]) {
            console.warn(`Pose "${poseName}" not found, defaulting to idle.`);
            poseName = 'idle';
        }
        this.targetPose = this.poses[poseName];
        this.currentPose = this.currentPose || this.targetPose;
        this.interpolationProgress = 0;
        console.log("Setting pose:", poseName);
    }

    lerpFrames(frameA, frameB, t) {
        const result = {};
        for (let key in frameA) {
            result[key] = {
                x: frameA[key].x + (frameB[key].x - frameA[key].x) * t,
                y: frameA[key].y + (frameB[key].y - frameA[key].y) * t
            };
        }
        return result;
    }

    drawFrame(frame) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.primaryColor;
        ctx.fillStyle = this.secondaryColor;

        // Head
        ctx.beginPath();
        ctx.arc(frame.head.x, frame.head.y, this.headRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Spine
        this.drawLine(frame.neck, frame.spine);
        this.drawLine(frame.spine, frame.hip);

        // Arms
        this.drawLine(frame.leftShoulder, frame.leftElbow);
        this.drawLine(frame.leftElbow, frame.leftWrist);
        this.drawLine(frame.rightShoulder, frame.rightElbow);
        this.drawLine(frame.rightElbow, frame.rightWrist);

        // Legs
        this.drawLine(frame.leftHip, frame.leftKnee);
        this.drawLine(frame.leftKnee, frame.leftAnkle);
        this.drawLine(frame.rightHip, frame.rightKnee);
        this.drawLine(frame.rightKnee, frame.rightAnkle);

        // Joints
        for (let joint of Object.values(frame)) {
            ctx.beginPath();
            ctx.arc(joint.x, joint.y, this.jointRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawLine(p1, p2) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    animate() {
        if (!this.currentPose || !this.targetPose) return;

        const framesA = this.currentPose.frames[0];
        const framesB = this.targetPose.frames[0];

        this.interpolationProgress += this.interpolationSpeed;
        if (this.interpolationProgress > 1) {
            this.interpolationProgress = 0;
            this.currentPose = this.targetPose;
        }

        const interpFrame = this.lerpFrames(framesA, framesB, this.interpolationProgress);
        this.drawFrame(interpFrame);

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    playSign(signName) {
        // Normalize input: capitalize first letter
        if (signName) {
            signName = signName.charAt(0).toUpperCase() + signName.slice(1).toLowerCase();
        }
        this.setPose(this.poses[signName] ? signName : 'idle');
    }
}

// Global stickman instance
window.stickmanAvatar = new StickmanAvatar('avatar-canvas');

// Wire Play / Reset buttons if they exist
window.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-sign');
    const resetBtn = document.getElementById('reset-avatar');
    const messageInput = document.getElementById('message');

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            const msg = messageInput?.value.trim() || 'idle';
            stickmanAvatar.playSign(msg);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => stickmanAvatar.playSign('idle'));
    }
});
