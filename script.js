const state = {
  target: 36,
  runs: 0,
  wickets: 0,
  balls: 0,
  maxBalls: 18,
  totalBatsmen: 6,
  specialBalls: 1,
  specialMax: 2,
  bonusPoints: 0,
  consecutiveWickets: 0,
  consecutiveDots: 0,
  currentOverRuns: 0,
  gameOver: false,
  unlockedSpecial: false,
  dotStreakUnlocked: false,
  milestoneFlash: false,
};

const elements = {
  targetInput: document.getElementById('target-input'),
  targetValue: document.getElementById('target-value'),
  runsValue: document.getElementById('runs-value'),
  wicketsValue: document.getElementById('wickets-value'),
  ballsValue: document.getElementById('balls-value'),
  specialValue: document.getElementById('special-value'),
  pointsValue: document.getElementById('points-value'),
  overValue: document.getElementById('over-value'),
  statusMessage: document.getElementById('status-message'),
  milestoneMessage: document.getElementById('milestone-message'),
  bowlButton: document.getElementById('bowl-button'),
  resetButton: document.getElementById('reset-button'),
  specialToggle: document.getElementById('special-toggle'),
  batsman: document.getElementById('batsman'),
  ball: document.getElementById('ball'),
  logList: document.getElementById('log-list'),
  lineGroup: document.getElementById('line-group'),
  lengthGroup: document.getElementById('length-group'),
};

let selectedLine = 'off';
let selectedLength = 'good';

function formatOver(balls) {
  const over = Math.floor(balls / 6) + 1;
  const ballNumber = (balls % 6) + 1;
  return `Over ${over} • Ball ${ballNumber}`;
}

function updateScoreboard() {
  elements.targetValue.textContent = state.target;
  elements.runsValue.textContent = state.runs;
  elements.wicketsValue.textContent = `${state.wickets} / ${state.totalBatsmen}`;
  elements.ballsValue.textContent = `${state.balls} / ${state.maxBalls}`;
  elements.specialValue.textContent = `${state.specialBalls} / ${state.specialMax}`;
  elements.pointsValue.textContent = state.bonusPoints;
  const maidenHint = state.currentOverRuns === 0 ? 'Maiden in play' : `${state.currentOverRuns} runs this over`;
  elements.overValue.textContent = `${formatOver(state.balls)} • ${maidenHint}`;

  const remaining = state.target - state.runs;
  if (!state.gameOver) {
    elements.statusMessage.textContent = remaining > 0
      ? `Defend ${remaining} more run${remaining === 1 ? '' : 's'} across ${state.maxBalls - state.balls} balls.`
      : 'Target breached. You need wickets quickly!';
  }

  elements.specialToggle.disabled = state.specialBalls === 0;
}

function resetMilestones() {
  state.consecutiveWickets = 0;
  state.consecutiveDots = 0;
  state.dotStreakUnlocked = false;
}

function resetGame() {
  state.runs = 0;
  state.wickets = 0;
  state.balls = 0;
  state.specialBalls = 1;
  state.bonusPoints = 0;
  state.consecutiveWickets = 0;
  state.consecutiveDots = 0;
  state.currentOverRuns = 0;
  state.unlockedSpecial = false;
  state.dotStreakUnlocked = false;
  state.gameOver = false;
  state.milestoneFlash = false;
  elements.specialToggle.checked = false;
  elements.bowlButton.disabled = false;
  elements.specialToggle.disabled = false;
  elements.milestoneMessage.textContent = 'Welcome! Your first Acnol Clean Bowled Ball is ready.';
  elements.milestoneMessage.classList.add('status--highlight');
  elements.logList.innerHTML = '';
  updateScoreboard();
  elements.statusMessage.textContent = 'Choose a line and length, then bowl to defend your target.';
}

function clampTarget(value) {
  return Math.min(Math.max(value, 12), 72);
}

function handleTargetChange() {
  const value = clampTarget(Number(elements.targetInput.value) || state.target);
  state.target = value;
  elements.targetValue.textContent = value;
}

function setActiveChip(group, valueKey, selectedValue) {
  const buttons = Array.from(group.querySelectorAll('button'));
  buttons.forEach((btn) => {
    const isActive = btn.dataset[valueKey] === selectedValue;
    btn.classList.toggle('chip--active', isActive);
  });
}

function registerChipHandlers() {
  elements.lineGroup.addEventListener('click', (event) => {
    const target = event.target;
    if (target.matches('button[data-line]')) {
      selectedLine = target.dataset.line;
      setActiveChip(elements.lineGroup, 'line', selectedLine);
    }
  });

  elements.lengthGroup.addEventListener('click', (event) => {
    const target = event.target;
    if (target.matches('button[data-length]')) {
      selectedLength = target.dataset.length;
      setActiveChip(elements.lengthGroup, 'length', selectedLength);
    }
  });
}

function animateBall() {
  elements.ball.classList.remove('active');
  void elements.ball.offsetWidth; // force reflow
  elements.ball.classList.add('active');
}

function animateBatSwing() {
  elements.batsman.classList.add('swing');
  setTimeout(() => elements.batsman.classList.remove('swing'), 450);
}

function logBall(outcome, detail) {
  const item = document.createElement('li');
  const label = document.createElement('span');
  label.className = 'log__label';
  label.textContent = `${formatOver(state.balls - 1)} • ${selectedLine.toUpperCase()} line • ${selectedLength}`;

  const result = document.createElement('span');
  result.className = 'log__outcome';
  if (outcome === 'WICKET') result.classList.add('log__outcome--danger');
  if (outcome === 'DOT') result.classList.add('log__outcome--calm');
  if (['FOUR', 'SIX'].includes(outcome)) result.classList.add('log__outcome--success');
  result.textContent = detail;

  item.append(label, result);
  elements.logList.prepend(item);
}

function unlockSpecialBall(reason) {
  if (state.specialBalls >= state.specialMax || state.unlockedSpecial) return;
  state.specialBalls += 1;
  state.unlockedSpecial = true;
  elements.specialToggle.disabled = false;
  elements.milestoneMessage.textContent = reason;
  elements.milestoneMessage.classList.add('status--highlight');
  state.milestoneFlash = true;
}

function addBonus(points, message) {
  state.bonusPoints += points;
  elements.milestoneMessage.textContent = message;
  elements.milestoneMessage.classList.add('status--highlight');
  state.milestoneFlash = true;
}

function evaluateBonuses(outcome, usedSpecial) {
  if (outcome === 'WICKET') {
    state.consecutiveWickets += 1;
    state.consecutiveDots = 0;
    state.dotStreakUnlocked = false;

    if (state.consecutiveWickets === 2) {
      addBonus(40, 'Two wickets in a row! +40 points and a Clean Bowled delivery unlocked.');
      unlockSpecialBall('Two wickets in a row unlocked an Acnol Clean Bowled Ball!');
    }
    if (state.consecutiveWickets === 3) {
      addBonus(50, 'Hat-trick! +50 points.');
    }
    if (usedSpecial) {
      addBonus(50, 'Acnol Clean Bowled Ball earned +50 points!');
    }
  } else if (outcome === 'DOT') {
    state.consecutiveDots += 1;
    state.consecutiveWickets = 0;
    if (state.consecutiveDots === 3 && !state.dotStreakUnlocked) {
      state.dotStreakUnlocked = true;
      addBonus(10, 'Three dot balls! +10 points and a Clean Bowled delivery unlocked.');
      unlockSpecialBall('Three dot balls unlocked an Acnol Clean Bowled Ball!');
    }
  } else {
    state.consecutiveWickets = 0;
    state.consecutiveDots = 0;
    state.dotStreakUnlocked = false;
  }
}

function endOfOverCheck() {
  if (state.balls > 0 && state.balls % 6 === 0) {
    if (state.currentOverRuns === 0) {
      addBonus(25, 'Maiden over! +25 points.');
    }
    state.currentOverRuns = 0;
  }
}

function chooseOutcome() {
  let wicketProb = 0.12;
  let dotProb = 0.34;
  let fourProb = 0.26;
  let sixProb = 0.28;

  if (selectedLength === 'yorker') {
    wicketProb += 0.07;
    sixProb -= 0.05;
    fourProb -= 0.02;
  }
  if (selectedLength === 'short') {
    sixProb += 0.08;
    dotProb -= 0.06;
  }
  if (selectedLength === 'good') {
    dotProb += 0.05;
  }

  if (selectedLine === 'off') {
    dotProb += 0.05;
    sixProb -= 0.02;
  }
  if (selectedLine === 'middle') {
    fourProb += 0.02;
  }
  if (selectedLine === 'leg') {
    sixProb += 0.04;
    wicketProb -= 0.02;
  }

  const total = wicketProb + dotProb + fourProb + sixProb;
  const normalizer = 1 / total;
  wicketProb *= normalizer;
  dotProb *= normalizer;
  fourProb *= normalizer;
  sixProb *= normalizer;

  const roll = Math.random();
  if (roll < wicketProb) return 'WICKET';
  if (roll < wicketProb + dotProb) return 'DOT';
  if (roll < wicketProb + dotProb + fourProb) return 'FOUR';
  return 'SIX';
}

function checkGameOver() {
  const outOfBatters = state.wickets >= state.totalBatsmen;
  const outOfBalls = state.balls >= state.maxBalls;
  const defended = state.runs < state.target;
  const breached = state.runs >= state.target;

  if (outOfBatters || outOfBalls || breached) {
    state.gameOver = true;
    elements.bowlButton.disabled = true;
    elements.specialToggle.disabled = true;

    if (breached && !outOfBatters && !outOfBalls) {
      elements.statusMessage.textContent = 'Target breached! Germs win this chase.';
    } else if (defended && (outOfBatters || outOfBalls)) {
      elements.statusMessage.textContent = 'You defended the target! Germs cleaned up by Acnol.';
    } else if (breached) {
      elements.statusMessage.textContent = 'Target was crossed. Better luck next time!';
    }
  }
}

function bowlDelivery() {
  if (state.gameOver) return;

  const usingSpecial = elements.specialToggle.checked && state.specialBalls > 0;
  if (usingSpecial) {
    state.specialBalls -= 1;
    elements.specialToggle.checked = false;
  }

  animateBall();
  animateBatSwing();

  let outcome = 'DOT';
  if (usingSpecial) {
    outcome = Math.random() < 0.999 ? 'WICKET' : chooseOutcome();
  } else {
    outcome = chooseOutcome();
  }

  state.balls += 1;

  if (outcome === 'WICKET') {
    state.wickets += 1;
    state.currentOverRuns += 0;
    logBall('WICKET', 'Cleaned up! Germ batter is out.');
  }
  if (outcome === 'DOT') {
    state.currentOverRuns += 0;
    logBall('DOT', 'Dot ball! Pressure building.');
  }
  if (outcome === 'FOUR') {
    state.runs += 4;
    state.currentOverRuns += 4;
    logBall('FOUR', 'Driven for four!');
  }
  if (outcome === 'SIX') {
    state.runs += 6;
    state.currentOverRuns += 6;
    logBall('SIX', 'Launched for six!');
  }

  evaluateBonuses(outcome, usingSpecial);
  endOfOverCheck();
  updateScoreboard();
  checkGameOver();

  if (state.gameOver) return;
  if (!state.milestoneFlash) {
    elements.milestoneMessage.classList.remove('status--highlight');
  } else {
    state.milestoneFlash = false;
  }
}

function wireEvents() {
  elements.bowlButton.addEventListener('click', bowlDelivery);
  elements.resetButton.addEventListener('click', resetGame);
  elements.targetInput.addEventListener('change', () => {
    handleTargetChange();
    updateScoreboard();
  });
}

function init() {
  registerChipHandlers();
  wireEvents();
  updateScoreboard();
}

init();
