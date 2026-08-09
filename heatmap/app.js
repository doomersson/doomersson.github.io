(function (global) {
  "use strict";

  const TEAM_A = "#ff5f6d";
  const TEAM_B = "#42d7ff";
  const TRAIL_MS = 30000;
  const MAX_GAP_MS = 1500;
  const JUMP_LIMIT = 2500;

  function finiteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function sanitizeName(value, fallback) {
    const text = String(value || "").trim();
    return text || fallback;
  }

  function parseRoute(input, sourceName) {
    const raw = typeof input === "string" ? JSON.parse(input) : input;
    if (!raw || !Array.isArray(raw.samples) || raw.samples.length === 0) {
      throw new Error("This file does not contain a non-empty samples array.");
    }

    const firstSample = raw.samples[0];
    const useElapsed = finiteNumber(firstSample.elapsedMs) !== null;
    const firstRawTime = useElapsed ? finiteNumber(firstSample.elapsedMs) : finiteNumber(firstSample.time);
    if (firstRawTime === null) {
      throw new Error("The route samples do not contain usable time values.");
    }

    const playerMap = new Map();
    let duration = 0;
    let validPointCount = 0;
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;

    raw.samples.forEach((sample, sampleIndex) => {
      const rawTime = useElapsed ? finiteNumber(sample.elapsedMs) : finiteNumber(sample.time);
      if (rawTime === null) return;
      const time = Math.max(0, Math.round(rawTime - firstRawTime));
      duration = Math.max(duration, time);
      const tanks = Array.isArray(sample.tanks) ? sample.tanks : [];

      tanks.forEach((tank, tankIndex) => {
        const x = finiteNumber(tank.x);
        const y = finiteNumber(tank.y);
        if (x === null || y === null) return;
        const fallbackId = "player-" + sampleIndex + "-" + tankIndex;
        const id = sanitizeName(tank.playerId, fallbackId);
        const name = sanitizeName(tank.nickname, id);
        const team = tank.team === "A" || tank.team === "B" ? tank.team : "?";
        const alive = tank.alive !== false;
        const spawn = sanitizeName(tank.spawnId, "");

        if (!playerMap.has(id)) {
          playerMap.set(id, {
            id,
            name,
            team,
            color: typeof tank.color === "string" ? tank.color : (team === "A" ? TEAM_A : TEAM_B),
            points: [],
            times: []
          });
        }

        const player = playerMap.get(id);
        if (player.name === player.id && name !== id) player.name = name;
        if (player.team === "?" && team !== "?") player.team = team;
        player.points.push([time, x, y, alive ? 1 : 0, spawn]);
        player.times.push(time);

        if (alive) {
          validPointCount += 1;
          xMin = Math.min(xMin, x);
          xMax = Math.max(xMax, x);
          yMin = Math.min(yMin, y);
          yMax = Math.max(yMax, y);
        }
      });
    });

    const players = Array.from(playerMap.values()).sort((a, b) => {
      if (a.team !== b.team) return a.team.localeCompare(b.team);
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });

    if (players.length === 0 || validPointCount === 0) {
      throw new Error("No usable player positions were found in this route file.");
    }

    players.forEach((player) => {
      const order = player.points.map((point, index) => index).sort((a, b) => player.points[a][0] - player.points[b][0]);
      player.points = order.map((index) => player.points[index]);
      player.times = player.points.map((point) => point[0]);
    });

    if (xMin === xMax) {
      xMin -= 1;
      xMax += 1;
    }
    if (yMin === yMax) {
      yMin -= 1;
      yMax += 1;
    }

    return {
      format: sanitizeName(raw.format, "route-data"),
      mapName: sanitizeName(raw.mapName, sourceName ? sourceName.replace(/\.(json|txt)$/i, "") : "Tanki route"),
      exportedAt: raw.exportedAt || null,
      sampleInterval: finiteNumber(raw.sampleInterval),
      sampleCount: raw.samples.length,
      duration,
      bounds: [xMin, xMax, yMin, yMax],
      players
    };
  }

  function binaryRight(values, target) {
    let low = 0;
    let high = values.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (values[middle] <= target) low = middle + 1;
      else high = middle;
    }
    return low;
  }

  function stateAt(player, time) {
    const index = binaryRight(player.times, time) - 1;
    if (index < 0) return null;
    const current = player.points[index];
    if (!current[3]) return null;
    const next = player.points[index + 1];
    if (!next || !next[3] || current[4] !== next[4] || next[0] <= current[0] || next[0] - current[0] > MAX_GAP_MS) {
      return [current[1], current[2], current[4]];
    }
    const mix = Math.max(0, Math.min(1, (time - current[0]) / (next[0] - current[0])));
    return [
      current[1] + (next[1] - current[1]) * mix,
      current[2] + (next[2] - current[2]) * mix,
      current[4]
    ];
  }

  function formatTime(milliseconds, includeTenths) {
    const totalSeconds = Math.max(0, milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const base = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    return includeTenths ? base + "." + Math.floor((totalSeconds % 1) * 10) : base;
  }

  function safeFilename(value) {
    return String(value || "route")
      .trim()
      .replace(/[^a-z0-9._-]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "route";
  }

  const Core = { parseRoute, stateAt, formatTime, safeFilename, binaryRight };
  global.TankiRouteStudioCore = Core;

  if (typeof document === "undefined") return;

  const byId = (id) => document.getElementById(id);
  const elements = {
    routeFile: byId("routeFile"),
    routeDropZone: byId("routeDropZone"),
    routeFileName: byId("routeFileName"),
    backgroundFile: byId("backgroundFile"),
    backgroundFit: byId("backgroundFit"),
    backgroundOpacity: byId("backgroundOpacity"),
    backgroundOpacityValue: byId("backgroundOpacityValue"),
    backgroundFileName: byId("backgroundFileName"),
    removeBackground: byId("removeBackground"),
    playerList: byId("playerList"),
    selectionCount: byId("selectionCount"),
    selectAll: byId("selectAll"),
    selectNone: byId("selectNone"),
    datasetName: byId("datasetName"),
    sampleCount: byId("sampleCount"),
    playerCount: byId("playerCount"),
    durationStat: byId("durationStat"),
    canvas: byId("routeCanvas"),
    exportCanvas: byId("exportCanvas"),
    emptyState: byId("emptyState"),
    playPause: byId("playPause"),
    playIcon: byId("playIcon"),
    timeline: byId("timeline"),
    playbackClock: byId("playbackClock"),
    activeCount: byId("activeCount"),
    previewSpeed: byId("previewSpeed"),
    exportPng: byId("exportPng"),
    exportTransparentPng: byId("exportTransparentPng"),
    exportSpeed: byId("exportSpeed"),
    exportEstimate: byId("exportEstimate"),
    exportVideo: byId("exportVideo"),
    exportProgress: byId("exportProgress"),
    exportProgressText: byId("exportProgressText"),
    exportProgressBar: byId("exportProgressBar"),
    cancelExport: byId("cancelExport"),
    statusLine: byId("statusLine")
  };

  const state = {
    route: null,
    selected: new Set(),
    currentTime: 0,
    playing: false,
    lastAnimationTime: performance.now(),
    backgroundImage: null,
    backgroundUrl: null,
    exportCancelled: false,
    exporting: false
  };

  function setStatus(message, isError) {
    elements.statusLine.textContent = message;
    elements.statusLine.classList.toggle("is-error", Boolean(isError));
  }

  function setRouteControls(enabled) {
    [
      elements.selectAll,
      elements.selectNone,
      elements.playPause,
      elements.timeline,
      elements.previewSpeed,
      elements.exportPng,
      elements.exportTransparentPng,
      elements.exportVideo
    ].forEach((control) => {
      control.disabled = !enabled;
    });
  }

  function teamColor(team) {
    return team === "A" ? TEAM_A : TEAM_B;
  }

  function hexToRgba(hex, alpha) {
    const fallback = [255, 255, 255];
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || ""));
    const rgb = match ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)] : fallback;
    return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + alpha + ")";
  }

  function makeProjector(route, width, height) {
    const [rawXMin, rawXMax, rawYMin, rawYMax] = route.bounds;
    const xPad = Math.max(1, (rawXMax - rawXMin) * 0.04);
    const yPad = Math.max(1, (rawYMax - rawYMin) * 0.04);
    const xMin = rawXMin - xPad;
    const xMax = rawXMax + xPad;
    const yMin = rawYMin - yPad;
    const yMax = rawYMax + yPad;
    const margin = { left: width * 0.105, right: width * 0.055, top: height * 0.105, bottom: height * 0.085 };
    const availableWidth = width - margin.left - margin.right;
    const availableHeight = height - margin.top - margin.bottom;
    const scale = Math.min(availableWidth / (xMax - xMin), availableHeight / (yMax - yMin));
    const usedWidth = (xMax - xMin) * scale;
    const usedHeight = (yMax - yMin) * scale;
    const left = margin.left + (availableWidth - usedWidth) / 2;
    const top = margin.top + (availableHeight - usedHeight) / 2;
    return {
      left,
      top,
      right: left + usedWidth,
      bottom: top + usedHeight,
      width: usedWidth,
      height: usedHeight,
      xMin,
      xMax,
      yMin,
      yMax,
      scale,
      point(x, y) {
        return [left + (x - xMin) * scale, top + usedHeight - (y - yMin) * scale];
      }
    };
  }

  function drawImageFit(context, image, box, fit, opacity) {
    if (!image) return;
    context.save();
    context.globalAlpha = opacity;
    context.beginPath();
    context.rect(box.left, box.top, box.width, box.height);
    context.clip();
    if (fit === "stretch") {
      context.drawImage(image, box.left, box.top, box.width, box.height);
      context.restore();
      return;
    }
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const boxRatio = box.width / box.height;
    const useWidth = fit === "cover" ? imageRatio < boxRatio : imageRatio > boxRatio;
    const drawWidth = useWidth ? box.width : box.height * imageRatio;
    const drawHeight = useWidth ? box.width / imageRatio : box.height;
    const x = box.left + (box.width - drawWidth) / 2;
    const y = box.top + (box.height - drawHeight) / 2;
    context.drawImage(image, x, y, drawWidth, drawHeight);
    context.restore();
  }

  function drawGrid(context, projector, width, height) {
    const minor = 2500;
    const major = 5000;
    context.save();
    context.font = "500 " + Math.round(width * 0.0125) + "px ui-sans-serif, system-ui, sans-serif";
    context.fillStyle = "#91a0b6";
    context.textAlign = "center";
    context.textBaseline = "top";
    for (let x = Math.ceil(projector.xMin / minor) * minor; x <= projector.xMax; x += minor) {
      const point = projector.point(x, 0);
      const isMajor = x % major === 0;
      context.strokeStyle = isMajor ? "#2c3e58" : "#1a2940";
      context.lineWidth = isMajor ? Math.max(1, width * 0.0014) : Math.max(1, width * 0.0008);
      context.beginPath();
      context.moveTo(point[0], projector.top);
      context.lineTo(point[0], projector.bottom);
      context.stroke();
      if (isMajor) context.fillText(x.toLocaleString(), point[0], projector.bottom + height * 0.018);
    }
    context.textAlign = "right";
    context.textBaseline = "middle";
    for (let y = Math.ceil(projector.yMin / minor) * minor; y <= projector.yMax; y += minor) {
      const point = projector.point(0, y);
      const isMajor = y % major === 0;
      context.strokeStyle = isMajor ? "#2c3e58" : "#1a2940";
      context.lineWidth = isMajor ? Math.max(1, width * 0.0014) : Math.max(1, width * 0.0008);
      context.beginPath();
      context.moveTo(projector.left, point[1]);
      context.lineTo(projector.right, point[1]);
      context.stroke();
      if (isMajor) context.fillText(y.toLocaleString(), projector.left - width * 0.016, point[1]);
    }
    context.restore();
  }

  function drawTrail(context, player, time, projector, width) {
    const endIndex = binaryRight(player.times, time);
    const startIndex = Math.max(0, binaryRight(player.times, Math.max(0, time - TRAIL_MS)) - 1);
    let segment = [];
    let previous = null;
    const color = teamColor(player.team);

    function strokeSegment(points) {
      if (points.length < 2) return;
      context.beginPath();
      context.moveTo(points[0][0], points[0][1]);
      for (let index = 1; index < points.length; index += 1) context.lineTo(points[index][0], points[index][1]);
      context.stroke();
    }

    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = Math.max(2, width * 0.0028);
    context.strokeStyle = hexToRgba(color, 0.34);

    for (let index = startIndex; index < endIndex; index += 1) {
      const point = player.points[index];
      if (!point[3]) {
        strokeSegment(segment);
        segment = [];
        previous = null;
        continue;
      }
      if (previous && (point[4] !== previous[4] || Math.hypot(point[1] - previous[1], point[2] - previous[2]) > JUMP_LIMIT)) {
        strokeSegment(segment);
        segment = [];
      }
      segment.push(projector.point(point[1], point[2]));
      previous = point;
    }

    const live = stateAt(player, time);
    if (live) segment.push(projector.point(live[0], live[1]));
    strokeSegment(segment);
    context.restore();
  }

  function drawMarker(context, player, live, projector, width, transparent) {
    const [x, y] = projector.point(live[0], live[1]);
    const radius = Math.max(7, width * 0.0085);
    const color = teamColor(player.team);
    context.save();
    context.fillStyle = color;
    context.strokeStyle = "#ffffff";
    context.lineWidth = Math.max(1.5, width * 0.0018);
    context.beginPath();
    if (player.team === "A") {
      context.arc(x, y, radius, 0, Math.PI * 2);
    } else {
      context.moveTo(x, y - radius * 1.2);
      context.lineTo(x + radius * 1.2, y);
      context.lineTo(x, y + radius * 1.2);
      context.lineTo(x - radius * 1.2, y);
      context.closePath();
    }
    context.fill();
    context.stroke();

    const fontSize = Math.max(12, Math.round(width * 0.014));
    context.font = "700 " + fontSize + "px ui-sans-serif, system-ui, sans-serif";
    context.textBaseline = "middle";
    context.textAlign = "left";
    const labelX = x + radius * 1.55;
    const labelY = y - radius * 0.55;
    const textWidth = context.measureText(player.name).width;
    const padX = width * 0.005;
    const padY = heightSafe(width * 0.003);
    if (!transparent) {
      context.fillStyle = "rgba(4, 8, 16, 0.84)";
      roundedRect(context, labelX - padX, labelY - fontSize * 0.65, textWidth + padX * 2, fontSize * 1.3 + padY, width * 0.0045);
      context.fill();
      context.fillStyle = "#f4f7fb";
    } else {
      context.lineWidth = Math.max(2, width * 0.003);
      context.strokeStyle = "rgba(0, 0, 0, 0.84)";
      context.strokeText(player.name, labelX, labelY);
      context.fillStyle = "#ffffff";
    }
    context.fillText(player.name, labelX, labelY);
    context.restore();
  }

  function heightSafe(value) {
    return Math.max(2, value);
  }

  function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function drawFrame(canvas, time, options) {
    const route = options.route || state.route;
    if (!route) return 0;
    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const transparent = Boolean(options.transparent);
    const projector = makeProjector(route, width, height);
    const selected = options.selected || state.selected;

    context.clearRect(0, 0, width, height);
    if (!transparent) {
      context.fillStyle = "#080d18";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "#0d1524";
      roundedRect(context, projector.left - width * 0.016, projector.top - height * 0.016, projector.width + width * 0.032, projector.height + height * 0.032, width * 0.018);
      context.fill();
      drawImageFit(
        context,
        state.backgroundImage,
        projector,
        elements.backgroundFit.value,
        Number(elements.backgroundOpacity.value) / 100
      );
      drawGrid(context, projector, width, height);
    }

    let active = 0;
    route.players.forEach((player) => {
      if (!selected.has(player.id)) return;
      drawTrail(context, player, time, projector, width);
    });
    route.players.forEach((player) => {
      if (!selected.has(player.id)) return;
      const live = stateAt(player, time);
      if (!live) return;
      active += 1;
      drawMarker(context, player, live, projector, width, transparent);
    });

    if (!transparent) drawCanvasChrome(context, route, time, active, width, height);
    return active;
  }

  function drawCanvasChrome(context, route, time, active, width, height) {
    context.save();
    context.fillStyle = "#f4f7fb";
    context.font = "800 " + Math.round(width * 0.027) + "px ui-sans-serif, system-ui, sans-serif";
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillText("TANK ROUTE REPLAY", width * 0.05, height * 0.042);
    context.font = "700 " + Math.round(width * 0.015) + "px ui-sans-serif, system-ui, sans-serif";
    context.fillStyle = TEAM_A;
    context.fillText("Team A  ●", width * 0.05, height * 0.078);
    context.fillStyle = TEAM_B;
    context.fillText("Team B  ◆", width * 0.165, height * 0.078);
    context.fillStyle = "#91a0b6";
    context.textAlign = "right";
    context.fillText(active + " active · " + state.selected.size + " selected", width * 0.95, height * 0.078);

    const barX = width * 0.05;
    const barY = height * 0.953;
    const barWidth = width * 0.9;
    context.fillStyle = "#1d2a3d";
    context.fillRect(barX, barY, barWidth, Math.max(5, height * 0.006));
    context.fillStyle = "#f4f7fb";
    context.fillRect(barX, barY, barWidth * Math.max(0, Math.min(1, time / route.duration)), Math.max(5, height * 0.006));
    context.font = "700 " + Math.round(width * 0.017) + "px ui-sans-serif, system-ui, sans-serif";
    context.textAlign = "left";
    context.fillText(formatTime(time) + " / " + formatTime(route.duration), barX, height * 0.983);
    context.font = "500 " + Math.round(width * 0.013) + "px ui-sans-serif, system-ui, sans-serif";
    context.fillStyle = "#91a0b6";
    context.textAlign = "right";
    context.fillText(route.mapName, width * 0.95, height * 0.983);
    context.restore();
  }

  function renderVisible() {
    if (!state.route) return;
    const active = drawFrame(elements.canvas, state.currentTime, { transparent: false });
    elements.activeCount.textContent = active + " active";
    elements.playbackClock.textContent = formatTime(state.currentTime) + " / " + formatTime(state.route.duration);
    elements.timeline.value = String(Math.round(state.currentTime / state.route.duration * 1000));
  }

  function updatePlayButton() {
    elements.playIcon.textContent = state.playing ? "Ⅱ" : "▶";
    elements.playPause.setAttribute("aria-label", state.playing ? "Pause route replay" : "Play route replay");
  }

  function stopPlayback() {
    state.playing = false;
    updatePlayButton();
  }

  function animationLoop(now) {
    const elapsed = now - state.lastAnimationTime;
    state.lastAnimationTime = now;
    if (state.route && state.playing && !state.exporting) {
      state.currentTime += elapsed * Number(elements.previewSpeed.value);
      if (state.currentTime >= state.route.duration) {
        state.currentTime = state.route.duration;
        stopPlayback();
      }
      renderVisible();
    }
    requestAnimationFrame(animationLoop);
  }

  function updatePlayerList() {
    const route = state.route;
    if (!route) return;
    elements.playerList.classList.remove("empty");
    elements.playerList.replaceChildren();
    route.players.forEach((player) => {
      const row = document.createElement("label");
      row.className = "player-row";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = state.selected.has(player.id);
      checkbox.dataset.playerId = player.id;
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) state.selected.add(player.id);
        else state.selected.delete(player.id);
        updateSelectionCount();
        renderVisible();
      });
      const shape = document.createElement("span");
      shape.className = "player-shape " + (player.team === "A" ? "team-a" : "team-b");
      shape.style.setProperty("--player-color", teamColor(player.team));
      shape.setAttribute("aria-hidden", "true");
      const name = document.createElement("span");
      name.className = "player-name";
      name.textContent = player.name;
      const team = document.createElement("span");
      team.className = "team-code";
      team.textContent = player.team === "?" ? "—" : player.team;
      row.append(checkbox, shape, name, team);
      elements.playerList.append(row);
    });
    updateSelectionCount();
  }

  function updateSelectionCount() {
    const total = state.route ? state.route.players.length : 0;
    elements.selectionCount.textContent = state.selected.size + " of " + total + " selected";
  }

  function updateExportEstimate() {
    if (!state.route) {
      elements.exportEstimate.textContent = "Upload route data to calculate length";
      return;
    }
    const speed = Math.max(0.25, Math.min(64, Number(elements.exportSpeed.value) || 8));
    const length = state.route.duration / speed;
    const mime = bestVideoMime();
    const format = mime && mime.startsWith("video/mp4") ? "MP4" : "WebM";
    elements.exportEstimate.textContent = formatTime(length, true) + " video · " + format + " · 1080×1080";
  }

  async function readRouteFile(file) {
    if (!file) return;
    stopPlayback();
    setStatus("Reading " + file.name + "…");
    try {
      const text = await file.text();
      const route = parseRoute(text, file.name);
      state.route = route;
      state.selected = new Set(route.players.map((player) => player.id));
      state.currentTime = 0;
      elements.routeFileName.textContent = file.name;
      elements.datasetName.textContent = route.mapName;
      elements.sampleCount.textContent = route.sampleCount.toLocaleString();
      elements.playerCount.textContent = route.players.length.toLocaleString();
      elements.durationStat.textContent = formatTime(route.duration);
      elements.emptyState.hidden = true;
      setRouteControls(true);
      updatePlayerList();
      updateExportEstimate();
      renderVisible();
      setStatus("Loaded " + route.players.length + " players across " + route.sampleCount.toLocaleString() + " samples.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not read this route file.", true);
    }
  }

  async function readBackgroundFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Choose an image file for the background.", true);
      return;
    }
    try {
      if (state.backgroundUrl) URL.revokeObjectURL(state.backgroundUrl);
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.decoding = "async";
      image.src = url;
      await image.decode();
      state.backgroundUrl = url;
      state.backgroundImage = image;
      elements.backgroundFileName.textContent = file.name;
      elements.removeBackground.disabled = false;
      renderVisible();
      setStatus("Background image loaded.");
    } catch (error) {
      setStatus("Could not decode that background image.", true);
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exportPng(transparent) {
    if (!state.route) return;
    drawFrame(elements.exportCanvas, state.currentTime, { transparent });
    elements.exportCanvas.toBlob((blob) => {
      if (!blob) {
        setStatus("The browser could not create the PNG.", true);
        return;
      }
      const suffix = transparent ? "-transparent" : "";
      const time = safeFilename(formatTime(state.currentTime).replace(":", "-"));
      downloadBlob(blob, safeFilename(state.route.mapName) + "-route-" + time + suffix + ".png");
      setStatus(transparent ? "Transparent PNG saved." : "PNG saved.");
    }, "image/png");
  }

  function bestVideoMime() {
    if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return "";
    const candidates = [
      "video/mp4;codecs=avc1.42E01E",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  }

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async function exportTimelapse() {
    if (!state.route || state.exporting) return;
    if (!elements.exportCanvas.captureStream || typeof MediaRecorder === "undefined") {
      setStatus("This browser cannot record canvas video. Use a current Chromium or Firefox browser.", true);
      return;
    }
    const mime = bestVideoMime();
    if (!mime) {
      setStatus("This browser does not offer a supported video recording format.", true);
      return;
    }

    const speed = Math.max(0.25, Math.min(64, Number(elements.exportSpeed.value) || 8));
    elements.exportSpeed.value = String(speed);
    const realDuration = state.route.duration / speed;
    const selectedSnapshot = new Set(state.selected);
    const chunks = [];
    state.exportCancelled = false;
    state.exporting = true;
    stopPlayback();
    elements.exportProgress.hidden = false;
    elements.exportVideo.disabled = true;
    elements.exportProgressBar.value = 0;
    elements.exportProgressText.textContent = "Rendering 0%";
    setStatus("Rendering the timelapse. Keep this tab open.");

    const stream = elements.exportCanvas.captureStream(30);
    const recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 10000000
    });
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data && event.data.size) chunks.push(event.data);
    });
    const stopped = new Promise((resolve, reject) => {
      recorder.addEventListener("stop", resolve, { once: true });
      recorder.addEventListener("error", () => reject(recorder.error || new Error("Video recording failed.")), { once: true });
    });

    try {
      drawFrame(elements.exportCanvas, 0, { transparent: false, selected: selectedSnapshot });
      recorder.start(1000);
      const startedAt = performance.now();
      while (!state.exportCancelled) {
        const elapsed = performance.now() - startedAt;
        const routeTime = Math.min(state.route.duration, elapsed * speed);
        drawFrame(elements.exportCanvas, routeTime, { transparent: false, selected: selectedSnapshot });
        const progress = Math.min(100, routeTime / state.route.duration * 100);
        elements.exportProgressBar.value = progress;
        elements.exportProgressText.textContent = "Rendering " + Math.floor(progress) + "%";
        if (elapsed >= realDuration) break;
        await wait(1000 / 30);
      }
      recorder.stop();
      await stopped;
      stream.getTracks().forEach((track) => track.stop());

      if (state.exportCancelled) {
        setStatus("Timelapse export cancelled.");
        return;
      }
      const blob = new Blob(chunks, { type: mime });
      const extension = mime.startsWith("video/mp4") ? "mp4" : "webm";
      const speedLabel = String(speed).replace(".", "-");
      downloadBlob(blob, safeFilename(state.route.mapName) + "-route-timelapse-" + speedLabel + "x." + extension);
      setStatus("Timelapse saved as " + extension.toUpperCase() + ".");
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop());
      setStatus(error instanceof Error ? error.message : "Timelapse export failed.", true);
    } finally {
      state.exporting = false;
      elements.exportProgress.hidden = true;
      elements.exportVideo.disabled = !state.route;
      renderVisible();
    }
  }

  elements.routeFile.addEventListener("change", () => readRouteFile(elements.routeFile.files[0]));
  elements.backgroundFile.addEventListener("change", () => readBackgroundFile(elements.backgroundFile.files[0]));

  ["dragenter", "dragover"].forEach((eventName) => {
    elements.routeDropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.routeDropZone.classList.add("is-dragging");
    });
  });
  ["dragleave", "drop"].forEach((eventName) => {
    elements.routeDropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.routeDropZone.classList.remove("is-dragging");
    });
  });
  elements.routeDropZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null;
    readRouteFile(file);
  });

  elements.backgroundFit.addEventListener("change", renderVisible);
  elements.backgroundOpacity.addEventListener("input", () => {
    elements.backgroundOpacityValue.textContent = elements.backgroundOpacity.value + "%";
    renderVisible();
  });
  elements.removeBackground.addEventListener("click", () => {
    if (state.backgroundUrl) URL.revokeObjectURL(state.backgroundUrl);
    state.backgroundUrl = null;
    state.backgroundImage = null;
    elements.backgroundFile.value = "";
    elements.backgroundFileName.textContent = "Default background";
    elements.removeBackground.disabled = true;
    renderVisible();
    setStatus("Background image removed.");
  });

  elements.selectAll.addEventListener("click", () => {
    state.selected = new Set(state.route.players.map((player) => player.id));
    updatePlayerList();
    renderVisible();
  });
  elements.selectNone.addEventListener("click", () => {
    state.selected.clear();
    updatePlayerList();
    renderVisible();
  });

  elements.playPause.addEventListener("click", () => {
    if (!state.route) return;
    if (state.currentTime >= state.route.duration) state.currentTime = 0;
    state.playing = !state.playing;
    state.lastAnimationTime = performance.now();
    updatePlayButton();
    renderVisible();
  });
  elements.timeline.addEventListener("input", () => {
    if (!state.route) return;
    state.currentTime = Number(elements.timeline.value) / 1000 * state.route.duration;
    renderVisible();
  });
  elements.exportSpeed.addEventListener("input", updateExportEstimate);
  elements.exportPng.addEventListener("click", () => exportPng(false));
  elements.exportTransparentPng.addEventListener("click", () => exportPng(true));
  elements.exportVideo.addEventListener("click", exportTimelapse);
  elements.cancelExport.addEventListener("click", () => {
    state.exportCancelled = true;
  });

  updateExportEstimate();
  updatePlayButton();
  requestAnimationFrame(animationLoop);
})(typeof window !== "undefined" ? window : globalThis);
