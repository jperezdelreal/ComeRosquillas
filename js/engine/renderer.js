// ==================== SPRITE RENDERER ====================
class Sprites {

        // ---- HOMER (detailed) ----
        static drawHomer(ctx, x, y, dir, mouthAngle, size) {
            const cx = x + size / 2;
            const cy = y + size / 2;
            const r = size / 2 - 1;
            const angles = [Math.PI * 1.5, 0, Math.PI * 0.5, Math.PI];
            const a = angles[dir];

            // Head shape (yellow)
            ctx.fillStyle = COLORS.simpsonYellow;
            ctx.beginPath();
            ctx.arc(cx, cy, r, a + mouthAngle, a + Math.PI * 2 - mouthAngle);
            ctx.lineTo(cx, cy);
            ctx.closePath();
            ctx.fill();

            // Outline
            ctx.strokeStyle = '#b8a000';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(cx, cy, r, a + mouthAngle, a + Math.PI * 2 - mouthAngle);
            ctx.stroke();

            // Hair (two strands on top) - M-shaped
            const hairBase = cy - r + 1;
            ctx.fillStyle = COLORS.simpsonYellow;
            ctx.strokeStyle = '#b8a000';
            ctx.lineWidth = 1;
            for (let i = -1; i <= 1; i += 2) {
                ctx.beginPath();
                ctx.moveTo(cx + i * 2, hairBase);
                ctx.lineTo(cx + i * 4, hairBase - 4);
                ctx.lineTo(cx + i * 1, hairBase - 1);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            // Eye (big white Simpson eye)
            const eyeDist = r * 0.35;
            const eyeAngle = a - 0.4;
            const eyeX = cx + Math.cos(eyeAngle) * eyeDist;
            const eyeY = cy + Math.sin(eyeAngle) * eyeDist;
            // White
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(eyeX, eyeY, 4.5, 5.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            // Pupil
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(eyeX + Math.cos(a) * 1.5, eyeY + Math.sin(a) * 1.5, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // 5 o'clock shadow (blue dots around mouth area)
            ctx.fillStyle = '#c8b850';
            const stubbleAngle = a + 0.6;
            for (let i = 0; i < 3; i++) {
                const sa = stubbleAngle + i * 0.25;
                const sx = cx + Math.cos(sa) * r * 0.55;
                const sy = cy + Math.sin(sa) * r * 0.55;
                ctx.beginPath();
                ctx.arc(sx, sy, 0.7, 0, Math.PI * 2);
                ctx.fill();
            }

            // Mouth interior (darker for depth)
            if (mouthAngle > 0.1) {
                ctx.fillStyle = '#8B0000';
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, r * 0.6, a - mouthAngle * 0.5, a + mouthAngle * 0.5);
                ctx.closePath();
                ctx.fill();
            }

            // Ear (small bump)
            const earAngle = a + Math.PI * 0.75;
            const earX = cx + Math.cos(earAngle) * (r - 2);
            const earY = cy + Math.sin(earAngle) * (r - 2);
            ctx.fillStyle = COLORS.simpsonYellow;
            ctx.beginPath();
            ctx.arc(earX, earY, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // ---- HOMER DYING ----
        static drawHomerDying(ctx, x, y, progress, size) {
            const cx = x + size / 2;
            const cy = y + size / 2;
            const r = (size / 2 - 1) * (1 - progress);
            ctx.globalAlpha = 1 - progress * 0.8;

            // Spinning shrink with stars
            ctx.fillStyle = COLORS.simpsonYellow;
            ctx.beginPath();
            ctx.arc(cx, cy, r, progress * Math.PI * 2, Math.PI * 4 - progress * Math.PI * 2);
            ctx.lineTo(cx, cy);
            ctx.closePath();
            ctx.fill();

            // Stars around head
            if (progress > 0.2 && progress < 0.8) {
                ctx.fillStyle = '#ffd800';
                for (let i = 0; i < 5; i++) {
                    const sa = (progress * 6 + i * Math.PI * 2 / 5);
                    const sr = r + 8 + progress * 10;
                    const sx = cx + Math.cos(sa) * sr;
                    const sy = cy + Math.sin(sa) * sr;
                    Sprites._drawStar(ctx, sx, sy, 3);
                }
            }

            ctx.globalAlpha = 1;
        }

        static _drawStar(ctx, x, y, r) {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const a1 = (i * Math.PI * 2 / 5) - Math.PI / 2;
                const a2 = a1 + Math.PI / 5;
                ctx.lineTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r);
                ctx.lineTo(x + Math.cos(a2) * r * 0.4, y + Math.sin(a2) * r * 0.4);
            }
            ctx.closePath();
            ctx.fill();
        }

        // ---- MINI HOMER (lives indicator) ----
        static drawMiniHomer(ctx, x, y) {
            ctx.fillStyle = COLORS.simpsonYellow;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0.25, Math.PI * 2 - 0.25);
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.fill();
            // Eye
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x + 2, y - 3, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x + 3, y - 3, 1, 0, Math.PI * 2);
            ctx.fill();
            // Hair
            ctx.fillStyle = COLORS.simpsonYellow;
            ctx.strokeStyle = '#b8a000';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, y - 7);
            ctx.lineTo(x + 1, y - 11);
            ctx.lineTo(x + 2, y - 8);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
        }

        // ---- DONUT ----
        static drawDonut(ctx, x, y, animFrame) {
            const r = 4;
            // Gentle donut rotation
            const rotation = animFrame * 0.015;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            // Donut body
            ctx.fillStyle = COLORS.donutBrown;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            // Pink frosting (top half with drips)
            ctx.fillStyle = COLORS.donutPink;
            ctx.beginPath();
            ctx.arc(0, 0, r, Math.PI * 1.1, Math.PI * -0.1);
            ctx.fill();
            // Frosting drips
            ctx.fillStyle = COLORS.donutDarkPink;
            ctx.beginPath();
            ctx.ellipse(-2, 1, 1, 2, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(2.5, 0.5, 0.8, 1.5, -0.2, 0, Math.PI * 2);
            ctx.fill();
            // Hole
            ctx.fillStyle = '#0a0a1a';
            ctx.beginPath();
            ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
            ctx.fill();
            // Sprinkles (rotate slowly)
            const phase = animFrame * 0.02;
            const sprinkleColors = [COLORS.sprinkle1, COLORS.sprinkle2, COLORS.sprinkle3, COLORS.sprinkle4, COLORS.sprinkle5];
            for (let i = 0; i < 5; i++) {
                const sa = phase + i * Math.PI * 2 / 5;
                const sx = Math.cos(sa) * (r - 1.5);
                const sy = -1 + Math.sin(sa) * 1.2;
                if (sy < 0) { // Only on frosting
                    ctx.fillStyle = sprinkleColors[i];
                    ctx.fillRect(sx - 0.5, sy - 0.5, 2, 1);
                }
            }
            ctx.restore();
        }

        // ---- DUFF BEER (power pellet) ----
        static drawDuff(ctx, x, y, animFrame) {
            const pulse = Math.sin(animFrame * 0.08) * 1.5;
            const r = 7 + pulse;
            // Can body
            ctx.fillStyle = COLORS.duffRed;
            ctx.beginPath();
            ctx.roundRect(x - r * 0.7, y - r, r * 1.4, r * 2, 2);
            ctx.fill();
            // Duff label (white band)
            ctx.fillStyle = '#fff';
            ctx.fillRect(x - r * 0.65, y - 3, r * 1.3, 7);
            // "DUFF" text
            ctx.fillStyle = COLORS.duffRed;
            ctx.font = 'bold 6px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('DUFF', x, y + 1);
            // Top of can (silver)
            ctx.fillStyle = '#c0c0c0';
            ctx.beginPath();
            ctx.ellipse(x, y - r + 1, r * 0.6, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Glow effect
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 + Math.sin(animFrame * 0.08) * 0.2})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, r + 3, 0, Math.PI * 2);
            ctx.stroke();
        }

        // ---- GHOSTS AS SIMPSONS CHARACTERS ----
        static drawGhost(ctx, ghost, animFrame, frightTimer, homer) {
            const cx = ghost.x + TILE / 2;
            const cy = ghost.y + TILE / 2;
            const r = TILE / 2 - 1;

            if (ghost.mode === GM_EATEN) {
                // Eyes track Homer's position when eaten
                const eyeDir = homer ? Sprites._eyeDirToward(cx, cy, homer) : ghost.dir;
                Sprites._drawGhostEyes(ctx, cx, cy, eyeDir);
                return;
            }

            if (ghost.mode === GM_FRIGHTENED) {
                Sprites._drawFrightenedGhost(ctx, cx, cy, r, animFrame, frightTimer);
                return;
            }

            // Compute eye tracking direction toward Homer
            const eyeDir = homer ? Sprites._eyeDirToward(cx, cy, homer) : ghost.dir;

            // Draw character-specific ghost
            switch (ghost.idx) {
                case 0: Sprites._drawBurns(ctx, cx, cy, r, eyeDir, animFrame); break;
                case 1: Sprites._drawSideshowBob(ctx, cx, cy, r, eyeDir, animFrame); break;
                case 2: Sprites._drawNelson(ctx, cx, cy, r, eyeDir, animFrame); break;
                case 3: Sprites._drawSnake(ctx, cx, cy, r, eyeDir, animFrame); break;
            }
        }

        // Compute fractional eye offset toward Homer for smooth eye tracking
        static _eyeDirToward(cx, cy, homer) {
            const hx = homer.x + TILE / 2;
            const hy = homer.y + TILE / 2;
            const dx = hx - cx;
            const dy = hy - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 1) return { lookX: 0, lookY: 0 };
            return { lookX: (dx / dist) * 2, lookY: (dy / dist) * 2 };
        }

        // Extract eye look offsets from dir (int) or eye-tracking object
        static _eyeOffset(dir) {
            if (typeof dir === 'object' && dir !== null) {
                return { ex: dir.lookX, ey: dir.lookY };
            }
            return { ex: DX[dir] * 1.5, ey: DY[dir] * 1.5 };
        }

        // -- Mr. Burns --
        static _drawBurns(ctx, cx, cy, r, dir, frame) {
            const wave = frame % 20 < 10 ? 1 : -1;

            // Body (sickly yellow-green suit)
            ctx.fillStyle = '#9acd32';
            ctx.beginPath();
            ctx.arc(cx, cy - 2, r, Math.PI, 0);
            ctx.lineTo(cx + r, cy + r);
            for (let i = 3; i >= 0; i--) {
                ctx.lineTo(cx - r + (i * 2 * r / 3), cy + r + (i % 2 === 0 ? wave * 3 : -wave * 3));
            }
            ctx.closePath();
            ctx.fill();

            // Head (yellowish, bald)
            ctx.fillStyle = '#f5e6a0';
            ctx.beginPath();
            ctx.arc(cx, cy - 3, r * 0.85, Math.PI, 0);
            ctx.fill();

            // Hunched posture line
            ctx.strokeStyle = '#8fbc3f';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(cx, cy - 1, r * 0.5, 0, Math.PI);
            ctx.stroke();

            // Eyes - droopy, menacing
            const burnEye = Sprites._eyeOffset(dir);
            for (const ox of [-4, 4]) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.ellipse(cx + ox, cy - 5, 3.5, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#556b2f'; // Green pupils (Burns' evil eyes)
                ctx.beginPath();
                ctx.arc(cx + ox + burnEye.ex, cy - 5 + burnEye.ey, 1.8, 0, Math.PI * 2);
                ctx.fill();
            }

            // Menacing eyebrows (very pronounced)
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 8, cy - 7);
            ctx.quadraticCurveTo(cx - 4, cy - 12, cx - 1, cy - 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + 1, cy - 8);
            ctx.quadraticCurveTo(cx + 4, cy - 12, cx + 8, cy - 7);
            ctx.stroke();

            // Pointy nose
            ctx.fillStyle = '#f5e6a0';
            ctx.beginPath();
            ctx.moveTo(cx, cy - 3);
            ctx.lineTo(cx + 3, cy - 1);
            ctx.lineTo(cx, cy);
            ctx.closePath();
            ctx.fill();

            // Evil grin
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy + 1, 4, 0.1, Math.PI - 0.1);
            ctx.stroke();

            // "Excellent" fingers (steepled)
            ctx.strokeStyle = '#f5e6a0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 3, cy + 5);
            ctx.lineTo(cx, cy + 2);
            ctx.lineTo(cx + 3, cy + 5);
            ctx.stroke();
        }

        // -- Sideshow Bob --
        static _drawSideshowBob(ctx, cx, cy, r, dir, frame) {
            const wave = frame % 20 < 10 ? 1 : -1;

            // Body (teal/green prison suit or his outfit)
            ctx.fillStyle = '#228b8b';
            ctx.beginPath();
            ctx.arc(cx, cy - 2, r, Math.PI, 0);
            ctx.lineTo(cx + r, cy + r);
            for (let i = 3; i >= 0; i--) {
                ctx.lineTo(cx - r + (i * 2 * r / 3), cy + r + (i % 2 === 0 ? wave * 3 : -wave * 3));
            }
            ctx.closePath();
            ctx.fill();

            // HUGE palm tree hair (Bob's most iconic feature)
            ctx.fillStyle = '#cc2200';
            // Main hair mass
            for (let i = -3; i <= 3; i++) {
                const hx = cx + i * 3;
                const spread = Math.abs(i) * 1.5;
                ctx.beginPath();
                ctx.ellipse(hx, cy - r - 5 - spread, 3, 7 + spread, i * 0.15, 0, Math.PI * 2);
                ctx.fill();
            }
            // Extra wild strands
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.ellipse(cx + i * 5, cy - r - 10, 2, 5, i * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }

            // Face
            ctx.fillStyle = '#f5d0a0';
            ctx.beginPath();
            ctx.arc(cx, cy - 2, r * 0.75, Math.PI * 0.1, Math.PI * 0.9);
            ctx.fill();

            // Eyes
            const bobEye = Sprites._eyeOffset(dir);
            for (const ox of [-4, 3]) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.ellipse(cx + ox, cy - 4, 3, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#2244aa';
                ctx.beginPath();
                ctx.arc(cx + ox + bobEye.ex, cy - 4 + bobEye.ey, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Long nose
            ctx.fillStyle = '#f5d0a0';
            ctx.beginPath();
            ctx.moveTo(cx - 1, cy - 3);
            ctx.lineTo(cx + 4, cy);
            ctx.lineTo(cx - 1, cy + 1);
            ctx.closePath();
            ctx.fill();

            // Sinister smile
            ctx.strokeStyle = '#8b0000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy + 2, 5, 0, Math.PI);
            ctx.stroke();

            // Big feet (Bob's huge feet!)
            ctx.fillStyle = '#ffd800';
            ctx.beginPath();
            ctx.ellipse(cx - 5, cy + r + 2, 5, 2.5, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx + 5, cy + r + 2, 5, 2.5, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // -- Nelson Muntz --
        static _drawNelson(ctx, cx, cy, r, dir, frame) {
            const wave = frame % 20 < 10 ? 1 : -1;

            // Body (pink/salmon shirt + blue vest)
            ctx.fillStyle = '#ff8c69'; // Salmon/orange shirt
            ctx.beginPath();
            ctx.arc(cx, cy - 2, r, Math.PI, 0);
            ctx.lineTo(cx + r, cy + r);
            for (let i = 3; i >= 0; i--) {
                ctx.lineTo(cx - r + (i * 2 * r / 3), cy + r + (i % 2 === 0 ? wave * 3 : -wave * 3));
            }
            ctx.closePath();
            ctx.fill();

            // Vest
            ctx.fillStyle = '#4169e1';
            ctx.beginPath();
            ctx.moveTo(cx - 4, cy - 1);
            ctx.lineTo(cx - 6, cy + r);
            ctx.lineTo(cx - 2, cy + r);
            ctx.lineTo(cx - 2, cy);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(cx + 4, cy - 1);
            ctx.lineTo(cx + 6, cy + r);
            ctx.lineTo(cx + 2, cy + r);
            ctx.lineTo(cx + 2, cy);
            ctx.closePath();
            ctx.fill();

            // Head (yellow Simpson skin)
            ctx.fillStyle = COLORS.simpsonYellow;
            ctx.beginPath();
            ctx.arc(cx, cy - 3, r * 0.8, Math.PI * 0.15, Math.PI * 0.85);
            ctx.fill();

            // Buzz cut hair (flat top spiky)
            ctx.fillStyle = '#c8a800';
            ctx.fillRect(cx - 6, cy - r - 1, 12, 4);
            // Buzz spikes
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(cx + i * 3 - 1, cy - r + 2);
                ctx.lineTo(cx + i * 3, cy - r - 2);
                ctx.lineTo(cx + i * 3 + 1, cy - r + 2);
                ctx.closePath();
                ctx.fill();
            }

            // Eyes (narrowed, tough look)
            const nelsonEye = Sprites._eyeOffset(dir);
            for (const ox of [-4, 4]) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.ellipse(cx + ox, cy - 4, 3, 2.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(cx + ox + nelsonEye.ex, cy - 4 + nelsonEye.ey * 0.67, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Angry eyebrows
            ctx.strokeStyle = '#8b7000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 7, cy - 4);
            ctx.lineTo(cx - 2, cy - 6);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + 2, cy - 6);
            ctx.lineTo(cx + 7, cy - 4);
            ctx.stroke();

            // Mean grin
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 4, cy + 1);
            ctx.lineTo(cx + 4, cy + 2);
            ctx.stroke();

            // "HA-HA!" text when chasing
            if (frame % 60 < 30) {
                ctx.fillStyle = '#ffd800';
                ctx.font = 'bold 7px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('HA-HA!', cx, cy - r - 5);
            }
        }

        // -- Snake Jailbird --
        static _drawSnake(ctx, cx, cy, r, dir, frame) {
            const wave = frame % 20 < 10 ? 1 : -1;

            // Body (orange prison jumpsuit)
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(cx, cy - 2, r, Math.PI, 0);
            ctx.lineTo(cx + r, cy + r);
            for (let i = 3; i >= 0; i--) {
                ctx.lineTo(cx - r + (i * 2 * r / 3), cy + r + (i % 2 === 0 ? wave * 3 : -wave * 3));
            }
            ctx.closePath();
            ctx.fill();

            // Prison number
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 5px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('7F20', cx, cy + 6);

            // Head
            ctx.fillStyle = '#f5d0a0';
            ctx.beginPath();
            ctx.arc(cx, cy - 3, r * 0.75, Math.PI * 0.15, Math.PI * 0.85);
            ctx.fill();

            // Long flowing hair (Snake's mullet)
            ctx.fillStyle = '#333';
            // Main hair
            ctx.beginPath();
            ctx.ellipse(cx, cy - r + 1, r * 0.8, 4, 0, Math.PI, 0);
            ctx.fill();
            // Flowing back
            ctx.beginPath();
            ctx.moveTo(cx + r * 0.6, cy - r + 3);
            ctx.quadraticCurveTo(cx + r + 2, cy - 3, cx + r, cy + 3);
            ctx.quadraticCurveTo(cx + r - 2, cy + 2, cx + r * 0.5, cy - r + 5);
            ctx.fill();
            // Left side
            ctx.beginPath();
            ctx.moveTo(cx - r * 0.6, cy - r + 3);
            ctx.quadraticCurveTo(cx - r - 1, cy - 3, cx - r + 1, cy + 2);
            ctx.quadraticCurveTo(cx - r + 2, cy, cx - r * 0.5, cy - r + 5);
            ctx.fill();

            // Eyes
            const snakeEye = Sprites._eyeOffset(dir);
            for (const ox of [-4, 4]) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.ellipse(cx + ox, cy - 4, 3, 3.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(cx + ox + snakeEye.ex, cy - 4 + snakeEye.ey, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Goatee
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.ellipse(cx, cy + 3, 2, 3, 0, 0, Math.PI);
            ctx.fill();

            // Tattoo (small on arm area)
            ctx.strokeStyle = '#006600';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(cx - 6, cy + 2);
            ctx.lineTo(cx - 8, cy);
            ctx.lineTo(cx - 6, cy - 1);
            ctx.stroke();
        }

        // -- Frightened Ghost (Simpsons-style scared face) --
        static _drawFrightenedGhost(ctx, cx, cy, r, frame, frightTimer) {
            const wave = frame % 20 < 10 ? 1 : -1;
            const flashing = frightTimer < FRIGHT_FLASH_TIME && frame % 16 < 8;
            const color = flashing ? '#ffffff' : '#5555ff';

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(cx, cy - 2, r, Math.PI, 0);
            ctx.lineTo(cx + r, cy + r);
            for (let i = 3; i >= 0; i--) {
                ctx.lineTo(cx - r + (i * 2 * r / 3), cy + r + (i % 2 === 0 ? wave * 3 : -wave * 3));
            }
            ctx.closePath();
            ctx.fill();

            // Scared face - swirly eyes (like Simpsons dizzy)
            const eyeColor = flashing ? '#555' : '#fff';
            ctx.strokeStyle = eyeColor;
            ctx.lineWidth = 1.2;
            for (const ox of [-4, 4]) {
                ctx.beginPath();
                ctx.arc(cx + ox, cy - 3, 3, 0, Math.PI * 1.5);
                ctx.stroke();
                // Dot center
                ctx.fillStyle = eyeColor;
                ctx.beginPath();
                ctx.arc(cx + ox, cy - 3, 1, 0, Math.PI * 2);
                ctx.fill();
            }

            // Wavy mouth (terrified)
            ctx.strokeStyle = eyeColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 6, cy + 3);
            for (let i = 0; i < 7; i++) {
                ctx.lineTo(cx - 6 + i * 2, cy + 3 + (i % 2 === 0 ? -2 : 2));
            }
            ctx.stroke();

            // Sweat drops
            if (frame % 30 < 15) {
                ctx.fillStyle = '#88ccff';
                ctx.beginPath();
                ctx.ellipse(cx + r - 1, cy - 1, 1, 2, 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // -- Ghost eyes only (eaten state) --
        static _drawGhostEyes(ctx, cx, cy, dir) {
            const eye = Sprites._eyeOffset(dir);
            for (const ox of [-4, 4]) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.ellipse(cx + ox, cy - 3, 4, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#2244cc';
                ctx.beginPath();
                ctx.arc(cx + ox + eye.ex, cy - 3 + eye.ey, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // ---- BONUS FRUIT (Springfield items by level) ----
        static drawBonusItem(ctx, x, y, level, frame) {
            switch ((level - 1) % 5) {
                case 0: // Krusty Burger
                    ctx.fillStyle = '#daa520';
                    ctx.beginPath();
                    ctx.arc(x, y, 6, Math.PI, 0);
                    ctx.fill();
                    ctx.fillStyle = '#8b4513';
                    ctx.fillRect(x - 5, y - 1, 10, 2);  // patty
                    ctx.fillStyle = '#228b22';
                    ctx.fillRect(x - 5, y + 1, 10, 1);  // lettuce
                    ctx.fillStyle = '#daa520';
                    ctx.beginPath();
                    ctx.arc(x, y + 2, 6, 0, Math.PI);
                    ctx.fill();
                    break;
                case 1: // Squishee
                    ctx.fillStyle = '#00bfff';
                    ctx.beginPath();
                    ctx.moveTo(x - 4, y - 6);
                    ctx.lineTo(x + 4, y - 6);
                    ctx.lineTo(x + 3, y + 4);
                    ctx.lineTo(x - 3, y + 4);
                    ctx.closePath();
                    ctx.fill();
                    // Straw
                    ctx.strokeStyle = '#ff0000';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x + 1, y - 6);
                    ctx.lineTo(x + 3, y - 10);
                    ctx.stroke();
                    break;
                case 2: // Buzz Cola
                    ctx.fillStyle = '#8b0000';
                    ctx.beginPath();
                    ctx.roundRect(x - 3, y - 6, 6, 12, 2);
                    ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 4px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('BC', x, y + 1);
                    break;
                case 3: // Radioactive donut
                    ctx.fillStyle = '#00ff00';
                    ctx.beginPath();
                    ctx.arc(x, y, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                    // Glow
                    ctx.strokeStyle = `rgba(0, 255, 0, ${0.3 + Math.sin(frame * 0.1) * 0.2})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x, y, 8, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                case 4: // Saxophone (Lisa's)
                    ctx.strokeStyle = '#daa520';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x, y - 7);
                    ctx.quadraticCurveTo(x + 5, y, x + 3, y + 5);
                    ctx.quadraticCurveTo(x, y + 8, x - 2, y + 6);
                    ctx.stroke();
                    ctx.fillStyle = '#daa520';
                    ctx.beginPath();
                    ctx.arc(x - 2, y + 6, 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        }

        // ==================== GHOST DEBUG OVERLAYS ====================

        // Draw mode icon + label above a ghost
        static drawGhostDebugLabel(ctx, ghost, animFrame) {
            const cx = ghost.x + TILE / 2
            const cy = ghost.y - 4
            const mode = ghost.mode
            const icon = GHOST_DEBUG.modeIcons[mode] || '?'
            const label = GHOST_DEBUG.modeLabels[mode] || '?'
            const color = GHOST_DEBUG.modeColors[mode] || '#fff'

            ctx.save()
            ctx.font = 'bold 8px monospace'
            ctx.textAlign = 'center'
            ctx.fillStyle = 'rgba(0,0,0,0.6)'
            ctx.fillRect(cx - 18, cy - 9, 36, 11)
            ctx.fillStyle = color
            ctx.fillText(`${icon}${label}`, cx, cy)
            ctx.restore()
        }

        // Draw dotted line from ghost to its target tile
        static drawTargetLine(ctx, ghost, target) {
            if (!target) return
            const gx = ghost.x + TILE / 2
            const gy = ghost.y + TILE / 2
            const tx = target.x * TILE + TILE / 2
            const ty = target.y * TILE + TILE / 2

            ctx.save()
            ctx.globalAlpha = GHOST_DEBUG.targetLineAlpha
            ctx.strokeStyle = ghost.color
            ctx.setLineDash([4, 4])
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(gx, gy)
            ctx.lineTo(tx, ty)
            ctx.stroke()
            ctx.setLineDash([])
            ctx.restore()
        }

        // Draw target tile outline
        static drawTargetTile(ctx, target, color) {
            if (!target) return
            ctx.save()
            ctx.globalAlpha = 0.5
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.strokeRect(target.x * TILE + 1, target.y * TILE + 1, TILE - 2, TILE - 2)
            ctx.restore()
        }

        // Burns personality: crosshair at target
        static drawBurnsCrosshair(ctx, target) {
            if (!target) return
            const tx = target.x * TILE + TILE / 2
            const ty = target.y * TILE + TILE / 2
            const sz = 8

            ctx.save()
            ctx.globalAlpha = 0.7
            ctx.strokeStyle = '#ffd800'
            ctx.lineWidth = 1.5
            // Horizontal
            ctx.beginPath()
            ctx.moveTo(tx - sz, ty); ctx.lineTo(tx + sz, ty)
            ctx.stroke()
            // Vertical
            ctx.beginPath()
            ctx.moveTo(tx, ty - sz); ctx.lineTo(tx, ty + sz)
            ctx.stroke()
            // Circle
            ctx.beginPath()
            ctx.arc(tx, ty, sz * 0.6, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
        }

        // Bob Patiño personality: speed lines trailing behind
        static drawBobSpeedLines(ctx, ghost, animFrame) {
            const cx = ghost.x + TILE / 2
            const cy = ghost.y + TILE / 2
            ctx.save()
            ctx.globalAlpha = 0.4
            ctx.strokeStyle = ghost.color
            ctx.lineWidth = 1
            for (let i = 1; i <= 3; i++) {
                const offset = i * 6 + (animFrame % 8)
                const dx = -DX[ghost.dir] * offset
                const dy = -DY[ghost.dir] * offset
                ctx.beginPath()
                ctx.moveTo(cx + dx - 3, cy + dy - 3)
                ctx.lineTo(cx + dx + 3, cy + dy + 3)
                ctx.stroke()
            }
            ctx.restore()
        }

        // Nelson personality: zigzag path preview
        static drawNelsonZigzag(ctx, ghost, target) {
            if (!target) return
            const gx = ghost.x + TILE / 2
            const gy = ghost.y + TILE / 2
            const tx = target.x * TILE + TILE / 2
            const ty = target.y * TILE + TILE / 2

            ctx.save()
            ctx.globalAlpha = 0.45
            ctx.strokeStyle = '#ff8c00'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(gx, gy)
            const steps = 6
            for (let i = 1; i <= steps; i++) {
                const t = i / steps
                const mx = gx + (tx - gx) * t
                const my = gy + (ty - gy) * t
                const zigOffset = (i % 2 === 0 ? 8 : -8)
                ctx.lineTo(mx + zigOffset, my)
            }
            ctx.lineTo(tx, ty)
            ctx.stroke()
            ctx.restore()
        }

        // Snake personality: speed variance percentage badge
        static drawSnakeSpeedBadge(ctx, ghost, baseSpeed) {
            const variance = baseSpeed > 0
                ? Math.round(((ghost.speed / baseSpeed) - 1) * 100)
                : 0
            const label = `${variance >= 0 ? '+' : ''}${variance}%`
            const cx = ghost.x + TILE / 2
            const cy = ghost.y + TILE + 6

            ctx.save()
            ctx.font = 'bold 7px monospace'
            ctx.textAlign = 'center'
            ctx.fillStyle = 'rgba(0,0,0,0.6)'
            ctx.fillRect(cx - 14, cy - 6, 28, 9)
            ctx.fillStyle = variance > 0 ? '#ff6666' : variance < 0 ? '#66ff66' : '#fff'
            ctx.fillText(label, cx, cy + 1)
            ctx.restore()
        }

        // Breadcrumb dots along recent path
        static drawBreadcrumbs(ctx, crumbs, color) {
            if (!crumbs || crumbs.length === 0) return
            ctx.save()
            ctx.fillStyle = color
            for (let i = 0; i < crumbs.length; i++) {
                ctx.globalAlpha = GHOST_DEBUG.breadcrumbAlpha * ((i + 1) / crumbs.length)
                ctx.beginPath()
                ctx.arc(crumbs[i].x, crumbs[i].y, GHOST_DEBUG.breadcrumbRadius, 0, Math.PI * 2)
                ctx.fill()
            }
            ctx.restore()
        }

        // Dev console panel (FPS, entity count, collision checks)
        static drawDevConsole(ctx, stats, animFrame) {
            const x = 4, y = CANVAS_H - 60
            const lines = [
                `FPS: ${stats.fps}`,
                `Entities: ${stats.entityCount}`,
                `Collisions: ${stats.collisionChecks}/f`,
                `Ghosts: ${stats.ghostModes}`,
            ]

            ctx.save()
            ctx.fillStyle = 'rgba(0,0,0,0.75)'
            ctx.fillRect(x, y, 140, lines.length * 12 + 6)
            ctx.font = '9px monospace'
            ctx.textAlign = 'left'
            ctx.fillStyle = '#0f0'
            lines.forEach((line, i) => {
                ctx.fillText(line, x + 4, y + 12 + i * 12)
            })
            ctx.restore()
        }
    }

    // ==================== GAME ====================
    
